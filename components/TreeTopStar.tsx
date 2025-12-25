
import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { THEME_COLORS } from '../constants';

// Fix: Augment the global JSX namespace to include Three.js elements from @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface TreeTopStarProps {
  position: [number, number, number];
  visible: boolean;
}

const TreeTopStar: React.FC<TreeTopStarProps> = ({ position, visible }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const sparkGroupRef = useRef<THREE.Group>(null);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.8;
    const innerRadius = 0.3;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 1.5;
      meshRef.current.scale.setScalar(visible ? 1 + Math.sin(t * 4) * 0.1 : 0);
    }
    if (sparkGroupRef.current) sparkGroupRef.current.rotation.y = -t * 2;
  });

  if (!visible) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <extrudeGeometry args={[starShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 }]} />
        <meshStandardMaterial color={THEME_COLORS.white} emissive={THEME_COLORS.pinkHot} emissiveIntensity={10} toneMapped={false} />
      </mesh>
      <pointLight intensity={3} distance={5} color={THEME_COLORS.pinkHot} />
      <group ref={sparkGroupRef}>
        {[...Array(12)].map((_, i) => (
          <mesh key={i} position={[Math.cos((i/12)*Math.PI*2) * 1.2, Math.sin((i/12)*Math.PI*4)*0.5, Math.sin((i/12)*Math.PI*2)*1.2]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={THEME_COLORS.white} emissive={THEME_COLORS.white} emissiveIntensity={5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default TreeTopStar;
