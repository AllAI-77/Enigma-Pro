import React, { useState, useEffect, useRef } from 'react';
import { AlphabetMode } from '../types';
import { ALPHABET_LATIN, ALPHABET_CYRILLIC } from '../constants';

interface PlugboardProps {
  plugboard: Record<string, string>;
  onConnect: (char1: string, char2: string) => void;
  onDisconnect: (char: string) => void;
  mode: AlphabetMode;
}

const Plugboard: React.FC<PlugboardProps> = ({ plugboard, onConnect, onDisconnect, mode }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [cables, setCables] = useState<Array<{x1: number, y1: number, x2: number, y2: number, color: string, id: string}>>([]);

  const alphabetString = mode === 'cyrillic' ? ALPHABET_CYRILLIC : ALPHABET_LATIN;
  const alphabet = alphabetString.split('').filter(c => c !== '.'); // Filter out dot

  // Cable styles: Tailwind classes for buttons + Hex colors for SVG lines
  const cableStyles = [
    { tw: 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]', hex: '#ef4444' },
    { tw: 'border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]', hex: '#3b82f6' },
    { tw: 'border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]', hex: '#22c55e' },
    { tw: 'border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]', hex: '#eab308' },
    { tw: 'border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]', hex: '#a855f7' },
    { tw: 'border-pink-500 text-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]', hex: '#ec4899' },
    { tw: 'border-cyan-500 text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]', hex: '#06b6d4' },
    { tw: 'border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]', hex: '#f97316' },
    { tw: 'border-indigo-500 text-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]', hex: '#6366f1' },
    { tw: 'border-teal-500 text-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]', hex: '#14b8a6' },
  ];

  const getPairStyle = (char: string) => {
    const target = plugboard[char];
    if (!target) return null;
    
    const pair = [char, target].sort().join('');
    let hash = 0;
    for (let i = 0; i < pair.length; i++) {
        hash = pair.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % cableStyles.length;
    return cableStyles[index];
  };

  // Recalculate cable positions
  useEffect(() => {
    const calculateCables = () => {
        if (!containerRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const newCables: Array<{x1: number, y1: number, x2: number, y2: number, color: string, id: string}> = [];
        const processed = new Set<string>();

        Object.entries(plugboard).forEach(([char1, char2]) => {
            const pairId = [char1, char2].sort().join('-');
            if (processed.has(pairId)) return;
            processed.add(pairId);

            const el1 = buttonRefs.current[char1];
            const el2 = buttonRefs.current[char2];

            if (el1 && el2) {
                const rect1 = el1.getBoundingClientRect();
                const rect2 = el2.getBoundingClientRect();
                
                // Calculate center points relative to the container
                newCables.push({
                    x1: rect1.left - containerRect.left + rect1.width / 2,
                    y1: rect1.top - containerRect.top + rect1.height / 2,
                    x2: rect2.left - containerRect.left + rect2.width / 2,
                    y2: rect2.top - containerRect.top + rect2.height / 2,
                    color: getPairStyle(char1)?.hex || '#fff',
                    id: pairId
                });
            }
        });
        setCables(newCables);
    };

    // Calculate immediately and on resize/updates
    calculateCables();
    
    // Slight delay to ensure layout is stable (fonts loaded, flex wrap settled)
    const timeout = setTimeout(calculateCables, 50);
    
    window.addEventListener('resize', calculateCables);
    return () => {
        window.removeEventListener('resize', calculateCables);
        clearTimeout(timeout);
    }
  }, [plugboard, mode]);

  const handleSocketClick = (char: string) => {
    if (plugboard[char]) {
      onDisconnect(char);
      if (selected === char) setSelected(null);
    } else {
      if (selected === char) {
        setSelected(null);
      } else if (selected) {
        onConnect(selected, char);
        setSelected(null);
      } else {
        setSelected(char);
      }
    }
  };

  return (
    <div ref={containerRef} className="bg-military-900 p-4 md:p-6 rounded-xl border border-gray-700 shadow-inner relative overflow-hidden min-h-[200px]">
        {/* Decorative Background Text */}
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none select-none">
            <span className="text-4xl md:text-6xl font-bold font-mono">PLUG</span>
        </div>
        
        {/* SVG Layer for Cables */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {cables.map(cable => {
                // Calculate control point for Bezier curve to simulate gravity/slack
                const midX = (cable.x1 + cable.x2) / 2;
                const midY = (cable.y1 + cable.y2) / 2;
                // Add some "sag" to the cable based on distance
                const dist = Math.sqrt(Math.pow(cable.x2 - cable.x1, 2) + Math.pow(cable.y2 - cable.y1, 2));
                const sag = Math.min(dist * 0.3, 50); // Cap sag
                
                return (
                    <g key={cable.id}>
                        {/* Shadow/Outline for visibility against dark background */}
                        <path 
                            d={`M ${cable.x1} ${cable.y1} Q ${midX} ${midY + sag} ${cable.x2} ${cable.y2}`}
                            stroke="rgba(0,0,0,0.8)"
                            strokeWidth="6"
                            fill="none"
                        />
                        {/* Colored Cable */}
                        <path 
                            d={`M ${cable.x1} ${cable.y1} Q ${midX} ${midY + sag} ${cable.x2} ${cable.y2}`}
                            stroke={cable.color}
                            strokeWidth="3"
                            fill="none"
                            className="drop-shadow-lg"
                        />
                        {/* Connector ends */}
                        <circle cx={cable.x1} cy={cable.y1} r="4" fill={cable.color} />
                        <circle cx={cable.x2} cy={cable.y2} r="4" fill={cable.color} />
                    </g>
                );
            })}
        </svg>

        <div className="flex justify-between items-center mb-6 relative z-20">
            <h3 className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase">
                Steckerbrett (Plugboard)
            </h3>
            <div className="text-[10px] text-gray-500 font-mono bg-black/40 px-2 py-1 rounded border border-gray-800">
                {Object.keys(plugboard).length / 2} / 10 PAIRS
            </div>
        </div>

        {/* Sockets Grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center relative z-20">
            {alphabet.map((char) => {
                const isConnected = !!plugboard[char];
                const isSelected = selected === char;
                const style = getPairStyle(char);
                const colorClass = isConnected && style ? style.tw : 'border-gray-600 text-gray-600 hover:border-gray-400 hover:text-gray-400';
                
                const activeClass = isSelected 
                    ? 'bg-gray-700 border-white text-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)] ring-2 ring-white/50' 
                    : '';

                return (
                    <div key={char} className="flex flex-col items-center gap-1">
                        <button
                            ref={el => { buttonRefs.current[char] = el; }}
                            onClick={() => handleSocketClick(char)}
                            className={`
                                w-9 h-9 md:w-11 md:h-11 rounded-full border-2 flex items-center justify-center
                                font-mono font-bold text-sm md:text-base transition-all duration-200 relative
                                ${isConnected ? `bg-military-800 ${colorClass}` : 'bg-military-900'}
                                ${activeClass}
                                ${!isConnected && !isSelected ? colorClass : ''}
                            `}
                        >
                            {char}
                            {/* Inner socket hole visualization */}
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-current shadow-[0_0_5px_currentColor]' : 'bg-black/80'} absolute bottom-1.5`}></div>
                        </button>
                        {/* Label below socket to mimic real machine labels */}
                        <span className="text-[10px] font-mono text-gray-600 font-bold select-none">{char}</span>
                    </div>
                );
            })}
        </div>

        {/* Text representation of connections (Collapsible or small footer) */}
        {Object.keys(plugboard).length > 0 && (
            <div className="mt-8 pt-4 border-t border-gray-800/50 flex flex-wrap gap-2 justify-center relative z-20">
                {Object.keys(plugboard).sort().reduce((acc: string[], key) => {
                    const target = plugboard[key];
                    if (key < target) acc.push(`${key}↔${target}`);
                    return acc;
                }, []).map(pair => (
                    <span key={pair} className="px-2 py-1 bg-black/40 rounded text-[10px] font-mono text-gray-400 border border-gray-700/50">
                        {pair}
                    </span>
                ))}
            </div>
        )}
    </div>
  );
};

export default Plugboard;