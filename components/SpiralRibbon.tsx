
import React, { useMemo } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { TREE_CONFIG, THEME_COLORS } from '../constants';

// Fix: Augment the global JSX namespace to include Three.js elements from @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const SpiralRibbon: React.FC<{ visible: boolean }> = ({ visible }) => {
  const points = useMemo(() => {
    const pts = [];
    const segments = TREE_CONFIG.ribbonSegments;
    const totalAngle = TREE_CONFIG.ribbonTurns * Math.PI * 2;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * totalAngle;
      const y = t * TREE_CONFIG.height;
      const radius = (1 - t) * TREE_CONFIG.baseRadius * 1.08;
      
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  if (!visible) return null;

  return (
    <mesh>
      <tubeGeometry args={[curve, 128, 0.05, 8, false]} />
      <meshStandardMaterial 
        color={THEME_COLORS.white} 
        emissive={THEME_COLORS.white} 
        emissiveIntensity={4} 
        toneMapped={false}
      />
    </mesh>
  );
};

export default SpiralRibbon;
