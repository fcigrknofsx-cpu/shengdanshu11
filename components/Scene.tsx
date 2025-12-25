
import React, { useMemo } from 'react';
import { ThreeElements } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { ContactShadows } from '@react-three/drei';
import PinkDreamTree from './PinkDreamTree';
import { THEME_COLORS, AppState, ColorTheme, GestureType } from '../constants';

// Fix: Augment the global JSX namespace to include Three.js elements from @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  bloomIntensity: number;
  appState: AppState;
  colorTheme: ColorTheme;
  currentGesture: GestureType;
  handRotation: number;
  handScale: number;
}

const Scene: React.FC<SceneProps> = ({ 
  bloomIntensity, 
  appState, 
  colorTheme,
  currentGesture, 
  handRotation, 
  handScale 
}) => {
  const bloomVal = useMemo(() => {
    const base = bloomIntensity * 1.3;
    if (currentGesture === 'OPEN') return base * 2.0;
    if (currentGesture === 'GRAB') return base * 0.7;
    return base;
  }, [bloomIntensity, currentGesture]);

  const mainColor = useMemo(() => {
    if (colorTheme === 'PURPLE') return THEME_COLORS.purple;
    if (colorTheme === 'GOLD') return THEME_COLORS.gold;
    return THEME_COLORS.pinkHot;
  }, [colorTheme]);

  return (
    <>
      {/* Use lowercase tags for Three.js intrinsic elements */}
      <ambientLight intensity={0.2} />
      
      <spotLight 
        position={[15, 20, 15]} 
        angle={0.3} 
        penumbra={1} 
        intensity={10} 
        color={mainColor}
        castShadow
      />
      
      <pointLight position={[0, -2, 0]} intensity={5} distance={15} color={mainColor} />

      <PinkDreamTree 
        appState={appState} 
        colorTheme={colorTheme}
        currentGesture={currentGesture} 
        handRotation={handRotation} 
        handScale={handScale}
      />

      <ContactShadows 
        opacity={0.6} 
        scale={20} 
        blur={2.5} 
        far={4.5} 
        resolution={256} 
        color={colorTheme === 'GOLD' ? '#201000' : '#200010'} 
        position={[0, -6, 0]}
      />

      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom 
          luminanceThreshold={0.7} 
          mipmapBlur 
          intensity={bloomVal} 
          radius={0.4} 
        />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.05} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;
