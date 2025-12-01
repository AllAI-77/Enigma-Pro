
import { RotorType, EnigmaModel, AlphabetMode } from './types';

export const ALPHABET_LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Uzbek Cyrillic Expanded (38 chars)
// Order: АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯЎҚҒҲ.
export const ALPHABET_CYRILLIC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯЎҚҒҲ.';

// --- LATIN CONFIG (Standard Enigma I + M3 + K) ---
export const ROTOR_WIRING_LATIN: Record<RotorType, string> = {
  [RotorType.I]:   'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  [RotorType.II]:  'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  [RotorType.III]: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  [RotorType.IV]:  'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  [RotorType.V]:   'VZBRGITYUPSDNHLXAWMJQOFECK',
  [RotorType.VI]:  'JPGVOUMFYQBENHZRDKASXLICTW', // M3 specific
  [RotorType.VII]: 'NZJHGRCXMYSWBOUFAIVLPEKQDT', // M3 specific
  // Enigma K (Swiss)
  [RotorType.K_I]:   'PEZUOHXSCVFMTBGLRINQJWAYDK',
  [RotorType.K_II]:  'ZOUESYDKFWPCIQXHMVBLGNJRAT',
  [RotorType.K_III]: 'EHRVXGAOBQUSIMZFLYNWKTPDJC',
  [RotorType.K_IV]:  'ESOVPZJAYQUIRHXLNFTGKDCMWB', // Placeholder
  [RotorType.K_V]:   'VZBRGITYUPSDNHLXAWMJQOFECK', // Placeholder
};

export const ROTOR_NOTCH_LATIN: Record<RotorType, string> = {
  [RotorType.I]:   'Q',
  [RotorType.II]:  'E',
  [RotorType.III]: 'V',
  [RotorType.IV]:  'J',
  [RotorType.V]:   'Z',
  [RotorType.VI]:  'ZM',
  [RotorType.VII]: 'ZM',
  [RotorType.K_I]:   'Y',
  [RotorType.K_II]:  'E',
  [RotorType.K_III]: 'N',
  [RotorType.K_IV]:  'J',
  [RotorType.K_V]:   'Z',
};

export const REFLECTORS_LATIN: Record<string, string> = {
  'B': 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  'C': 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
};

// --- CYRILLIC CONFIG (Verified 38-char Permutations) ---
export const ROTOR_WIRING_CYRILLIC: Record<RotorType, string> = {
  [RotorType.I]:   'ФҲГЖДЛОРПАВЫЯЧСМИТЬБЮЭЪЁНКУЦЙЗХЩЎҒҚ.ШЕ', 
  [RotorType.II]:  'ЯЧСМИТЬБЮФЫВАПРОЛДЖЭЪЁНКУЦЙЗХГШЩ.ЎҚҒҲЕ',
  [RotorType.III]: 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.ЎҚҒҲЁ',
  [RotorType.IV]:  'ЭЖДЛОРПАВЫФЯЧСМИТЬБЮ.ҲГНКУЦЙЗХЎҒҚШЩЕЪЁ',
  [RotorType.V]:   'ПРОЛДЖЭЯЧСМИТЬБЮФЫВА.ЙЦУКЕНГШЩЗХЪЁЎҚҒҲ',
  [RotorType.VI]:  'ФҲГЖДЛОРПАВЫЯЧСМИТЬБЮЭЪЁНКУЦЙЗХЩЎҒҚ.ШЕ', // Placeholder
  [RotorType.VII]: 'ЯЧСМИТЬБЮФЫВАПРОЛДЖЭЪЁНКУЦЙЗХГШЩ.ЎҚҒҲЕ', // Placeholder
  // Enigma K placeholders for Cyrillic (Mapping to I-V for type safety)
  [RotorType.K_I]:   'ФҲГЖДЛОРПАВЫЯЧСМИТЬБЮЭЪЁНКУЦЙЗХЩЎҒҚ.ШЕ',
  [RotorType.K_II]:  'ЯЧСМИТЬБЮФЫВАПРОЛДЖЭЪЁНКУЦЙЗХГШЩ.ЎҚҒҲЕ',
  [RotorType.K_III]: 'ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ.ЎҚҒҲЁ',
  [RotorType.K_IV]:  'ЭЖДЛОРПАВЫФЯЧСМИТЬБЮ.ҲГНКУЦЙЗХЎҒҚШЩЕЪЁ',
  [RotorType.K_V]:   'ПРОЛДЖЭЯЧСМИТЬБЮФЫВА.ЙЦУКЕНГШЩЗХЪЁЎҚҒҲ',
};

export const ROTOR_NOTCH_CYRILLIC: Record<RotorType, string> = {
  [RotorType.I]:   'Р',
  [RotorType.II]:  'Ж',
  [RotorType.III]: 'Я',
  [RotorType.IV]:  'К',
  [RotorType.V]:   'М',
  [RotorType.VI]:  'А',
  [RotorType.VII]: 'А',
  [RotorType.K_I]:   'Р',
  [RotorType.K_II]:  'Ж',
  [RotorType.K_III]: 'Я',
  [RotorType.K_IV]:  'К',
  [RotorType.K_V]:   'М',
};

export const REFLECTORS_CYRILLIC: Record<string, string> = {
  'B': '.ҲҒҚЎЯЮЭЬЫЪЩШЧЦХФУТСРПОНМЛКЙИЗЖЁЕДГВБА',
  'C': 'БАГВЕДЖЁИЗКЙМЛОНРПТСФУЦХШЧЪЩЬЫЮЭЎЯҒҚ.Ҳ'
};

// --- MACHINE MODELS SPECIFICATIONS ---
export interface MachineSpec {
  id: EnigmaModel;
  name: string;
  description: string;
  mode: AlphabetMode;
  allowedRotors: RotorType[];
  allowedReflectors: string[];
}

export const MACHINE_SPECS: Record<EnigmaModel, MachineSpec> = {
  'enigma-i': {
    id: 'enigma-i',
    name: 'Enigma I (Wehrmacht)',
    description: 'Standard German Army/Air Force model used during WWII.',
    mode: 'latin',
    allowedRotors: [RotorType.I, RotorType.II, RotorType.III, RotorType.IV, RotorType.V],
    allowedReflectors: ['B', 'C']
  },
  'enigma-m3': {
    id: 'enigma-m3',
    name: 'Enigma M3 (Kriegsmarine)',
    description: 'Naval model with additional rotors (VI, VII) for higher security.',
    mode: 'latin',
    allowedRotors: [RotorType.I, RotorType.II, RotorType.III, RotorType.IV, RotorType.V, RotorType.VI, RotorType.VII],
    allowedReflectors: ['B', 'C']
  },
  'enigma-k': {
    id: 'enigma-k',
    name: 'Enigma K (Commercial)',
    description: 'Commercial variant with distinct internal wiring.',
    mode: 'latin',
    allowedRotors: [RotorType.K_I, RotorType.K_II, RotorType.K_III, RotorType.K_IV, RotorType.K_V],
    allowedReflectors: ['B', 'C']
  },
  'enigma-uz': {
    id: 'enigma-uz',
    name: 'Enigma UZ (Maxsus)',
    description: 'Modern 38-letter variant adapted for Uzbek Cyrillic alphabet.',
    mode: 'cyrillic',
    allowedRotors: [RotorType.I, RotorType.II, RotorType.III, RotorType.IV, RotorType.V],
    allowedReflectors: ['B', 'C']
  }
};

export const INITIAL_CONFIG_LATIN = {
  model: 'enigma-i' as EnigmaModel,
  mode: 'latin' as const,
  rotors: [
    { type: RotorType.I, position: 0, ringSetting: 0 },
    { type: RotorType.II, position: 0, ringSetting: 0 },
    { type: RotorType.III, position: 0, ringSetting: 0 },
  ],
  reflector: 'B',
  plugboard: {},
};

export const INITIAL_CONFIG_CYRILLIC = {
  model: 'enigma-uz' as EnigmaModel,
  mode: 'cyrillic' as const,
  rotors: [
    { type: RotorType.I, position: 0, ringSetting: 0 },
    { type: RotorType.II, position: 0, ringSetting: 0 },
    { type: RotorType.III, position: 0, ringSetting: 0 },
  ],
  reflector: 'B',
  plugboard: {},
};
