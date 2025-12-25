
import React, { useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import TreeLeaves from './TreeLeaves';
import TreeOrnaments from './TreeOrnaments';
import SpiralRibbon from './SpiralRibbon';
import TreeTopStar from './TreeTopStar';
import { TREE_CONFIG, AppState, ColorTheme, GestureType } from '../constants';

// Fix: Augment the global JSX namespace to include Three.js elements from @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface PinkDreamTreeProps {
  appState: AppState;
  colorTheme: ColorTheme;
  currentGesture: GestureType;
  handRotation: number;
  handScale: number;
}

const PinkDreamTree: React.FC<PinkDreamTreeProps> = ({ 
  appState, 
  colorTheme,
  currentGesture, 
  handRotation, 
  handScale 
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const baseRotation = state.clock.getElapsedTime() * 0.12;
      const rotMultiplier = currentGesture === 'OPEN' ? 2 : 1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        baseRotation + (handRotation * rotMultiplier), 
        0.05
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, -TREE_CONFIG.height / 2, 0]}>
      <TreeLeaves 
        appState={appState} 
        colorTheme={colorTheme}
        currentGesture={currentGesture} 
        handScale={handScale}
      />
      <TreeOrnaments 
        appState={appState} 
        colorTheme={colorTheme}
        currentGesture={currentGesture} 
      />
      <SpiralRibbon visible={appState === 'TREE'} />
      <TreeTopStar position={[0, TREE_CONFIG.height + 0.5, 0]} visible={appState === 'TREE'} />
    </group>
  );
};

export default PinkDreamTree;
