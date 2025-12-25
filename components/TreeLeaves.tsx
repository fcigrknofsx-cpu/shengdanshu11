
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, THEME_COLORS, AppState, ColorTheme, GestureType } from '../constants';

// Fix: Augment the global JSX namespace to include Three.js elements from @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

interface TreeLeavesProps {
  appState: AppState;
  colorTheme: ColorTheme;
  currentGesture: GestureType;
  handScale: number;
}

const TreeLeaves: React.FC<TreeLeavesProps> = ({ appState, colorTheme, currentGesture, handScale }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = TREE_CONFIG.leafCount;

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // Tree position setup
      const y = Math.random() * TREE_CONFIG.height;
      const progress = y / TREE_CONFIG.height;
      const radiusAtY = (1 - progress) * TREE_CONFIG.baseRadius;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.7) * radiusAtY;
      const treePos = new THREE.Vector3(Math.cos(angle) * dist, y, Math.sin(angle) * dist);

      // Explode (Nebula) position setup
      const exRadius = (0.5 + Math.random() * 0.5) * TREE_CONFIG.explodeRadius;
      const exPhi = Math.acos(2 * Math.random() - 1);
      const exTheta = 2 * Math.PI * Math.random();
      const explodePos = new THREE.Vector3()
        .setFromSphericalCoords(exRadius, exPhi, exTheta)
        .add(new THREE.Vector3(0, TREE_CONFIG.height / 2, 0));

      data.push({
        treePos,
        explodePos,
        currentPos: treePos.clone(),
        scale: Math.random() * 0.12 + 0.04,
        speed: Math.random() * 0.8 + 0.2,
        offset: Math.random() * Math.PI * 2,
        // Color variants
        pink: Math.random() > 0.4 ? THEME_COLORS.pinkSoft : THEME_COLORS.pinkHot,
        purple: Math.random() > 0.4 ? '#C084FC' : '#9333EA',
        gold: Math.random() > 0.4 ? '#FDE047' : '#EAB308',
      });
    }
    return data;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      let target = new THREE.Vector3();
      let lerpSpeed = TREE_CONFIG.lerpSpeed;

      if (appState === 'TREE') {
        target.copy(p.treePos);
        if (currentGesture === 'GRAB') {
          // Extra squeeze/intensify during fist grab
          lerpSpeed *= 2.5;
          target.multiplyScalar(0.85);
        }
      } else {
        // EXPLODE / NEBULA state
        target.copy(p.explodePos);
        // Apply hand scaling to the nebula radius
        const effectiveScale = Math.max(0.5, handScale);
        target.multiplyScalar(effectiveScale * 1.2);
        
        if (currentGesture === 'OPEN') {
          lerpSpeed *= 0.6; // Softer, drifting movement
        }
      }

      p.currentPos.lerp(target, lerpSpeed);

      const twinkle = Math.sin(time * 2 + p.offset) * 0.2 + 0.8;
      
      tempObject.position.set(
        p.currentPos.x, 
        p.currentPos.y + Math.sin(time * 0.5 + p.offset) * 0.05, 
        p.currentPos.z
      );
      
      // Floating rotation
      tempObject.rotation.set(time * 0.2 + p.offset, time * 0.3, 0);
      
      // Twinkle and base scale
      tempObject.scale.setScalar(p.scale * twinkle);
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Handle Color Themes
      let baseHex;
      if (colorTheme === 'PURPLE') baseHex = p.purple;
      else if (colorTheme === 'GOLD') baseHex = p.gold;
      else baseHex = p.pink;

      tempColor.set(baseHex);
      
      // Brighten based on twinkle
      if (twinkle > 0.95) {
        tempColor.lerp(new THREE.Color('#ffffff'), (twinkle - 0.95) * 10);
      }
      
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.OctahedronGeometry(1, 0), undefined, count]} castShadow>
      <meshStandardMaterial roughness={0.3} metalness={0.7} />
    </instancedMesh>
  );
};

export default TreeLeaves;
