import React from 'react';
import { AlphabetMode } from '../types';

interface LampboardProps {
  litChar: string | null;
  mode: AlphabetMode;
}

const Lampboard: React.FC<LampboardProps> = ({ litChar, mode }) => {
  
  const rowsLatin = [
    "QWERTZUIO",
    "ASDFGHJK",
    "PYXCVBNML"
  ];

  // Uzbek Cyrillic Layout (Approximate standard typewriter)
  // АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЪЬЭЮЯЎҚҒҲ.
  const rowsCyrillic = [
    "ЙЦУКЕНГШЩЗХЪ",
    "ФЫВАПРОЛДЖЭ",
    "ЯЧСМИТЬБЮ.ЎҚҒҲ"
  ];

  const rows = mode === 'cyrillic' ? rowsCyrillic : rowsLatin;

  return (
    <div className="bg-black p-4 md:p-6 rounded-xl border-4 border-gray-800 shadow-2xl relative">
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-gray-600 text-[10px] tracking-[0.3em] font-bold">
          {mode === 'cyrillic' ? 'LAMPBOARD (KIRILL)' : 'LAMPBOARD'}
      </div>
      <div className="flex flex-col gap-2 md:gap-3 items-center mt-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 md:gap-3 justify-center flex-wrap">
            {row.split('').map((char) => {
              const isActive = litChar === char;
              return (
                <div
                  key={char}
                  className={`
                    w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center
                    font-bold text-xs md:text-lg border-2 transition-all duration-75
                    ${isActive 
                      ? 'lamp-active border-neon-amber text-yellow-100 scale-110' 
                      : 'border-gray-700 bg-gray-900 text-gray-700'}
                  `}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lampboard;