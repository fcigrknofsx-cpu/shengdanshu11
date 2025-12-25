
import React, { useEffect, useRef, useState } from 'react';
import { GestureType } from '../constants';

interface HandGestureControllerProps {
  onGesture: (gesture: GestureType) => void;
  onMove: (x: number, y: number) => void;
}

const HandGestureController: React.FC<HandGestureControllerProps> = ({ onGesture, onMove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let landmarker: any;
    let requestRef: number;
    let stream: MediaStream | null = null;
    let isUnmounted = false;

    const setupMediaPipe = async () => {
      try {
        const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3');
        const { HandLandmarker, FilesetResolver } = vision;

        const visionFiles = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        if (isUnmounted) return;

        landmarker = await HandLandmarker.createFromOptions(visionFiles, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, frameRate: { ideal: 30 } } 
          });
          
          if (videoRef.current && !isUnmounted) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
              videoRef.current?.play().then(() => {
                setActive(true);
                predict();
              }).catch(err => {
                console.warn("Autoplay error:", err);
              });
            };
          }
        }
      } catch (err: any) {
        console.error("MediaPipe failure:", err);
        setError("Optical Sensor Offline");
      }
    };

    const getDist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const predict = () => {
      if (isUnmounted) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video && landmarker && video.readyState >= 2) {
        const results = landmarker.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0 && canvas) {
          const landmarks = results.landmarks[0];
          const wrist = landmarks[0];
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const middleTip = landmarks[12];
          const ringTip = landmarks[16];
          const pinkyTip = landmarks[20];

          // Detection metrics
          const distThumbIndex = getDist(thumbTip, indexTip);
          const fingerTips = [indexTip, middleTip, ringTip, pinkyTip];
          const avgTipToWrist = fingerTips.reduce((acc, t) => acc + getDist(t, wrist), 0) / 4;
          
          const isIndexExt = getDist(indexTip, wrist) > 0.22;
          const isMiddleExt = getDist(middleTip, wrist) > 0.22;
          const isRingExt = getDist(ringTip, wrist) > 0.22;
          const isPinkyExt = getDist(pinkyTip, wrist) > 0.22;
          const isThumbExt = getDist(thumbTip, wrist) > 0.18;

          let detected: GestureType = 'OPEN';

          // Gesture Logic
          if (avgTipToWrist < 0.16) {
            detected = 'GRAB'; // 👊 Fist
          } 
          else if (distThumbIndex < 0.05 && isMiddleExt && isRingExt) {
            detected = 'OK'; // 👌 Purple Theme Trigger
          }
          else if (isThumbExt && !isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt && thumbTip.y < wrist.y) {
            detected = 'THUMBS_UP'; // 👍 Pink Theme Trigger
          }
          else if (isThumbExt && isIndexExt && isMiddleExt && !isRingExt && !isPinkyExt) {
            detected = 'THREE_FINGERS'; // 🖖 Gold Theme Trigger
          }
          else if (avgTipToWrist > 0.28) {
            detected = 'OPEN'; // 🖐 Nebula
          }

          onGesture(detected);
          
          // Coordinate Normalization for Cursor
          // We use indexTip for better "follow finger" precision
          // Since the video is mirrored, 1-x maps to screen-left
          const screenX = 1 - indexTip.x;
          const screenY = indexTip.y;
          onMove(screenX, screenY);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Skeleton Drawing
            ctx.strokeStyle = detected === 'OK' ? '#A855F7' : '#FF69B4';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.strokeStyle;
            
            const connections = [
              [0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], 
              [0,13,14,15,16], [0,17,18,19,20], [5,9,13,17,0]
            ];
            connections.forEach(path => {
              ctx.beginPath();
              path.forEach((idx, i) => {
                const p = landmarks[idx];
                if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
                else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
              });
              ctx.stroke();
            });

            // Joints
            ctx.fillStyle = "#ffffff";
            landmarks.forEach((p: any) => {
              ctx.beginPath();
              ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2);
              ctx.fill();
            });

            ctx.restore();
            
            // HUD Overlay
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(10, 10, 200, 60);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Inter";
            ctx.fillText("TACTILE ENGINE STATUS", 20, 30);
            ctx.fillStyle = detected === 'OK' ? '#D8B4FE' : '#FF69B4';
            ctx.font = "bold 18px Inter";
            ctx.fillText(`MODE: ${detected}`, 20, 52);
          }
        } else if (canvas && video) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.restore();
          }
        }
      }
      requestRef = requestAnimationFrame(predict);
    };

    setupMediaPipe();
    return () => {
      isUnmounted = true;
      cancelAnimationFrame(requestRef);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 w-64 h-48 bg-black/90 rounded-2xl border-2 border-pink-500/30 overflow-hidden backdrop-blur-xl z-[150] shadow-2xl">
      {!active && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-2" />
          <p className="text-[10px] text-pink-300 font-bold tracking-widest uppercase">Syncing Optics...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/40 text-red-100 font-bold text-xs p-4 text-center z-20 uppercase tracking-widest">
          {error}
        </div>
      )}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 px-2 py-1 rounded-full border border-pink-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[7px] font-bold text-white uppercase tracking-tighter">Sensor Live</span>
      </div>
    </div>
  );
};

export default HandGestureController;
