
import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import HandGestureController from './components/HandGestureController';
import { THEME_COLORS, AppState, ColorTheme, GestureType } from './constants';

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [gestureMode, setGestureMode] = useState(false);
  const [intensity, setIntensity] = useState(1.5);
  const [appState, setAppState] = useState<AppState>('TREE');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('PINK');
  const [currentGesture, setCurrentGesture] = useState<GestureType>('OPEN');
  
  const [handRotation, setHandRotation] = useState(0);
  const [handScale, setHandScale] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const targetCursorPos = useRef({ x: -100, y: -100 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('https://cdn.pixabay.com/audio/2021/11/25/audio_51c6e1e8cc.mp3');
    audio.loop = true;
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  useEffect(() => {
    if (hasEntered && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    } else if (!hasEntered && audioRef.current) {
      audioRef.current.pause();
    }
  }, [hasEntered]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleState = useCallback(() => {
    if (!hasEntered) return;
    setAppState(prev => prev === 'TREE' ? 'EXPLODE' : 'TREE');
  }, [hasEntered]);

  const handleGesture = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
    
    // Core State Transitions
    if (gesture === 'GRAB') setAppState('TREE');
    if (gesture === 'OPEN') setAppState('EXPLODE');
    
    // Dynamic Theme Mapping
    if (gesture === 'THUMBS_UP') setColorTheme('PINK');
    if (gesture === 'OK') setColorTheme('PURPLE');
    if (gesture === 'THREE_FINGERS') setColorTheme('GOLD');
    
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gestureMode) {
        targetCursorPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gestureMode]);

  useEffect(() => {
    let frameId: number;
    const smooth = () => {
      setCursorPos(prev => ({
        x: prev.x + (targetCursorPos.current.x - prev.x) * 0.2,
        y: prev.y + (targetCursorPos.current.y - prev.y) * 0.2,
      }));
      frameId = requestAnimationFrame(smooth);
    };
    frameId = requestAnimationFrame(smooth);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="w-full h-screen relative bg-[#050103] cursor-none overflow-hidden" onClick={toggleState}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 5, 25]} fov={45} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Scene 
            bloomIntensity={intensity} 
            appState={appState} 
            colorTheme={colorTheme}
            currentGesture={currentGesture} 
            handRotation={handRotation} 
            handScale={handScale}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={10} 
          maxDistance={50}
          maxPolarAngle={Math.PI / 1.7}
          enabled={hasEntered && !gestureMode}
        />
      </Canvas>

      <UIOverlay 
        intensity={intensity} 
        setIntensity={setIntensity} 
        appState={appState} 
        colorTheme={colorTheme}
        hasEntered={hasEntered}
        onEnter={(g) => { setGestureMode(g); setHasEntered(true); }}
        onExit={() => { setHasEntered(false); setGestureMode(false); }}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {gestureMode && hasEntered && (
        <HandGestureController 
          onGesture={handleGesture}
          onMove={(x, y) => {
            // Mapping 0-1 normalized to screen pixels
            targetCursorPos.current = { 
              x: x * window.innerWidth, 
              y: y * window.innerHeight 
            };
            
            // Spatial logic for Nebula
            if (currentGesture === 'OPEN') {
              const rot = (x - 0.5) * Math.PI * 4;
              const scale = 0.5 + (1 - y) * 1.5;
              setHandRotation(rot);
              setHandScale(scale);
            }
          }}
        />
      )}

      {hasEntered && (
        <div 
          className="fixed pointer-events-none w-10 h-10 z-[200] mix-blend-screen transition-transform duration-200"
          style={{ 
            left: cursorPos.x, 
            top: cursorPos.y, 
            transform: `translate(-50%, -50%) scale(${
              currentGesture === 'GRAB' ? 0.4 : 
              currentGesture === 'OPEN' ? 1.8 : 
              currentGesture === 'OK' ? 1.2 : 1
            })`,
          }}
        >
          {/* Main Glow Ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 opacity-80 animate-ping" 
            style={{ borderColor: colorTheme === 'PURPLE' ? '#C084FC' : colorTheme === 'GOLD' ? '#FACC15' : '#FF69B4' }}
          />
          {/* Inner Static Ring */}
          <div 
            className="absolute inset-1.5 rounded-full border-2 shadow-[0_0_15px_currentColor]" 
            style={{ color: colorTheme === 'PURPLE' ? '#A855F7' : colorTheme === 'GOLD' ? '#EAB308' : '#FF1493' }}
          />
          {/* Center Point */}
          <div className="absolute inset-[42%] rounded-full bg-white shadow-[0_0_10px_white]" />
        </div>
      )}
    </div>
  );
};

export default App;
