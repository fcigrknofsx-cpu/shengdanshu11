
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

interface TreeOrnamentsProps {
  appState: AppState;
  colorTheme: ColorTheme;
  currentGesture: GestureType;
}

const TreeOrnaments: React.FC<TreeOrnamentsProps> = ({ appState, colorTheme, currentGesture }) => {
  const cubeMeshRef = useRef<THREE.InstancedMesh>(null);
  const icoMeshRef = useRef<THREE.InstancedMesh>(null);
  const countPerType = Math.floor(TREE_CONFIG.ornamentCount / 2);

  const ornamentData = useMemo(() => {
    const generateSet = () => {
      const data = [];
      for (let i = 0; i < countPerType; i++) {
        const y = Math.random() * (TREE_CONFIG.height - 1) + 0.5;
        const radiusAtY = (1 - (y / TREE_CONFIG.height)) * TREE_CONFIG.baseRadius;
        const angle = Math.random() * Math.PI * 2;
        const dist = (0.8 + Math.random() * 0.2) * radiusAtY;
        const treePos = new THREE.Vector3(Math.cos(angle) * dist, y, Math.sin(angle) * dist);

        const exRadius = (0.8 + Math.random() * 0.4) * TREE_CONFIG.explodeRadius;
        const exPhi = Math.acos(2 * Math.random() - 1);
        const exTheta = 2 * Math.PI * Math.random();
        const explodePos = new THREE.Vector3().setFromSphericalCoords(exRadius, exPhi, exTheta).add(new THREE.Vector3(0, TREE_CONFIG.height/2, 0));

        data.push({
          treePos,
          explodePos,
          currentPos: treePos.clone(),
          scale: Math.random() * 0.15 + 0.1,
          rotSpeed: Math.random() * 2 + 1,
          offset: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? THEME_COLORS.white : THEME_COLORS.lavender,
          goldColor: '#FDE047',
          purpleColor: '#E9D5FF'
        });
      }
      return data;
    };
    return { cubes: generateSet(), icos: generateSet() };
  }, [countPerType]);

  const updateInstances = (mesh: THREE.InstancedMesh, data: any[], time: number) => {
    data.forEach((p, i) => {
      let target = appState === 'TREE' ? p.treePos : p.explodePos;
      p.currentPos.lerp(target, TREE_CONFIG.lerpSpeed * 0.8);

      const pulse = Math.sin(time * 3 + p.offset) * 0.1 + 1;
      tempObject.position.set(p.currentPos.x, p.currentPos.y, p.currentPos.z);
      tempObject.rotation.set(time * p.rotSpeed, time * p.rotSpeed * 0.5, p.offset);
      tempObject.scale.setScalar(p.scale * pulse);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);

      let targetColor;
      if (colorTheme === 'GOLD') targetColor = p.goldColor;
      else if (colorTheme === 'PURPLE') targetColor = p.purpleColor;
      else targetColor = p.color;

      tempColor.set(targetColor);
      if (pulse > 1.05) tempColor.multiplyScalar(2.0);
      mesh.setColorAt(i, tempColor);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (cubeMeshRef.current) updateInstances(cubeMeshRef.current, ornamentData.cubes, time);
    if (icoMeshRef.current) updateInstances(icoMeshRef.current, ornamentData.icos, time);
  });

  return (
    <group>
      <instancedMesh ref={cubeMeshRef} args={[new THREE.BoxGeometry(1, 1, 1), undefined, countPerType]} castShadow>
        <meshStandardMaterial roughness={0.05} metalness={1.0} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={icoMeshRef} args={[new THREE.IcosahedronGeometry(0.7, 0), undefined, countPerType]} castShadow>
        <meshStandardMaterial roughness={0.05} metalness={1.0} toneMapped={false} />
      </instancedMesh>
    </group>
  );
};

export default TreeOrnaments;
