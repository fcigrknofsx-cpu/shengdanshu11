
import React from 'react';
import { Sparkles, Zap, Moon, Sun, Trees, Box, Volume2, VolumeX, Camera, Play, ArrowLeft, Palette } from 'lucide-react';
import { AppState, ColorTheme } from '../constants';

interface UIOverlayProps {
  intensity: number;
  setIntensity: (val: number) => void;
  appState: AppState;
  colorTheme: ColorTheme;
  hasEntered: boolean;
  onEnter: (withGesture: boolean) => void;
  onExit: () => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  intensity, 
  setIntensity, 
  appState, 
  colorTheme,
  hasEntered, 
  onEnter,
  onExit,
  isMuted,
  setIsMuted
}) => {
  if (!hasEntered) {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl px-6">
        <div className="max-w-xl w-full text-center space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-serif-premium tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,105,180,0.4)]">
              DREAMY XMAS
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto" />
            <p className="text-pink-200/50 font-mono tracking-[0.4em] text-xs uppercase">
              // Advanced Tactile Experience //
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onEnter(false); }}
              className="group relative px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 pointer-events-auto"
            >
              <Play size={18} fill="currentColor" />
              <span>Standard</span>
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onEnter(true); }}
              className="group px-10 py-5 bg-pink-600/20 backdrop-blur-md border border-pink-500/50 text-pink-100 font-bold uppercase tracking-widest text-sm rounded-full hover:bg-pink-600/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 pointer-events-auto"
            >
              <Camera size={18} />
              <span>GESTURE MODE</span>
            </button>
          </div>

          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 text-[9px] font-mono text-pink-200 uppercase">
             <div>👊 Tree</div>
             <div>🖐 Nebula</div>
             <div>👍 Pink</div>
             <div>👌 Purple</div>
             <div>🖖 Gold</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 text-white z-10">
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex gap-4 items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onExit(); }}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all group flex items-center gap-2"
          >
            <ArrowLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-pink-500 font-serif-premium italic">
              Dreamy Xmas
            </h1>
            <p className="text-pink-200/60 font-mono text-[10px] tracking-widest uppercase">
              {appState} // {colorTheme}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="p-3 rounded-full bg-pink-900/20 backdrop-blur-md border border-pink-500/30 hover:bg-pink-500/40 transition-all pointer-events-auto relative group"
          >
            {isMuted ? <VolumeX size={18} className="text-pink-500" /> : <Volume2 size={18} className="text-pink-300 animate-pulse" />}
          </button>
          
          <div className="px-4 py-2 bg-pink-900/40 backdrop-blur-md rounded-full border border-pink-500/30 flex items-center gap-2">
            <Palette size={14} className="text-pink-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{colorTheme}</span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIntensity(intensity === 1.5 ? 0.5 : 1.5); }}
            className="p-3 rounded-full bg-pink-900/20 backdrop-blur-md border border-pink-500/30 hover:bg-pink-500/40 transition-all pointer-events-auto"
          >
            {intensity > 1 ? <Sun size={18} className="text-pink-300" /> : <Moon size={18} className="text-pink-500" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-auto">
        <div className="max-w-xs md:max-w-md bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-pink-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-pink-400" size={16} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-pink-300">Spatial Engine</h2>
          </div>
          <p className="text-[9px] text-pink-100/60 leading-relaxed font-mono mb-4 italic">
            🖐 Open hand: Rotate & Scale Nebula. <br/>
            👊 Closed fist: Revert to Tree structure. <br/>
            👍 OK/Three: Toggle color themes.
          </p>
          <div>
            <label className="text-[9px] uppercase text-pink-400 mb-2 block font-bold tracking-widest">Bloom Field</label>
            <input 
              type="range" 
              min="0.1" 
              max="4.0" 
              step="0.1"
              value={intensity}
              onChange={(e) => { e.stopPropagation(); setIntensity(parseFloat(e.target.value)); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full accent-pink-500 bg-pink-900/50 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="text-right">
          <p className="text-pink-400 font-mono text-[10px] mb-1 uppercase tracking-widest font-bold">Tactile.Link // Active</p>
          <p className="text-pink-100/40 text-[9px] uppercase tracking-tighter">AI Gesture Analysis Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
