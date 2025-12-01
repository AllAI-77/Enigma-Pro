
import React from 'react';
import { RotorSettings, RotorType, AlphabetMode } from '../types';
import { ALPHABET_LATIN, ALPHABET_CYRILLIC } from '../constants';

interface RotorUnitProps {
  settings: RotorSettings;
  onChange: (newSettings: RotorSettings) => void;
  label: string;
  mode: AlphabetMode;
  allowedRotors: RotorType[];
}

const RotorUnit: React.FC<RotorUnitProps> = ({ settings, onChange, label, mode, allowedRotors }) => {
  const currentAlphabet = mode === 'cyrillic' ? ALPHABET_CYRILLIC : ALPHABET_LATIN;
  const mod = currentAlphabet.length;
  
  const handlePositionChange = (delta: number) => {
    const newPos = (settings.position + delta + mod) % mod;
    onChange({ ...settings, position: newPos });
  };

  const handleRingChange = (delta: number) => {
    const newRing = (settings.ringSetting + delta + mod) % mod;
    onChange({ ...settings, ringSetting: newRing });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...settings, type: e.target.value as RotorType });
  };

  const currentChar = currentAlphabet[settings.position];
  const prevChar = currentAlphabet[(settings.position - 1 + mod) % mod];
  const nextChar = currentAlphabet[(settings.position + 1) % mod];
  
  // Format ring setting (0-based internally, show as 01, 02...)
  const ringDisplay = (settings.ringSetting + 1).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center bg-military-800 p-2 md:p-3 rounded-lg border border-military-500 shadow-lg transition-all hover:border-emerald-500/50 w-24 md:w-28">
      <span className="text-[10px] md:text-xs text-military-500 mb-2 font-mono uppercase tracking-widest text-center">{label}</span>
      
      {/* Rotor Type Selector */}
      <select 
        value={settings.type} 
        onChange={handleTypeChange}
        className="w-full bg-military-900 text-emerald-400 text-[10px] md:text-xs font-mono mb-3 p-1 rounded border border-military-500 focus:outline-none focus:border-emerald-500 cursor-pointer text-center appearance-none"
      >
        {allowedRotors.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Visual Wheel */}
      <div className="relative w-full h-24 md:h-28 bg-gradient-to-b from-black via-gray-800 to-black rounded-lg border-x-4 border-gray-700 flex flex-col items-center justify-center overflow-hidden mb-2">
        
        {/* Shadow overlays */}
        <div className="absolute top-0 w-full h-8 bg-gradient-to-b from-black to-transparent pointer-events-none z-10 opacity-80"></div>
        <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none z-10 opacity-80"></div>

        {/* Up Button - Always visible/accessible */}
        <button 
            onClick={() => handlePositionChange(1)} 
            className="absolute top-0 w-full h-8 z-20 flex items-start justify-center pt-1 text-gray-500 hover:text-white transition-colors focus:outline-none active:text-emerald-500"
            aria-label="Rotate Up"
        >
            ▲
        </button>
        
        <div className="flex flex-col items-center gap-0 font-mono font-bold text-gray-600 blur-[0.5px] scale-75 select-none opacity-50">
            {prevChar}
        </div>
        <div className="font-mono text-2xl md:text-3xl font-bold text-white my-0.5 z-0 bg-white/5 w-full text-center py-1 border-y border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] select-none">
            {currentChar}
        </div>
        <div className="flex flex-col items-center gap-0 font-mono font-bold text-gray-600 blur-[0.5px] scale-75 select-none opacity-50">
            {nextChar}
        </div>

        {/* Down Button - Always visible/accessible */}
        <button 
            onClick={() => handlePositionChange(-1)} 
            className="absolute bottom-0 w-full h-8 z-20 flex items-end justify-center pb-1 text-gray-500 hover:text-white transition-colors focus:outline-none active:text-emerald-500"
            aria-label="Rotate Down"
        >
            ▼
        </button>
      </div>

      {/* Ring Setting Controls */}
      <div className="flex items-center justify-between w-full bg-black/30 rounded px-1 py-1 gap-1 border border-white/5">
        <button 
            onClick={() => handleRingChange(-1)}
            className="text-gray-500 hover:text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            title="Ring Setting -"
        >
            -
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[8px] text-gray-500 uppercase leading-none scale-75">Ring</span>
             <span className="text-xs font-mono text-neon-amber font-bold">{ringDisplay}</span>
        </div>
        <button 
            onClick={() => handleRingChange(1)}
            className="text-gray-500 hover:text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            title="Ring Setting +"
        >
            +
        </button>
      </div>
    </div>
  );
};

export default RotorUnit;
