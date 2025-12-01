
import { RotorType, EnigmaModel, AlphabetMode } from './types';

export const ALPHABET_LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Uzbek Cyrillic Expanded (38 chars)
// Order: АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯЎҚҒҲ.
export const ALPHABET_CYRILLIC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯЎҚҒҲ.';

// --- LATIN CONFIG (Standard Enigma I + M3) ---
export const ROTOR_WIRING_LATIN: Record<RotorType, string> = {
  [RotorType.I]:   'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  [RotorType.II]:  'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  [RotorType.III]: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  [RotorType.IV]:  'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  [RotorType.V]:   'VZBRGITYUPSDNHLXAWMJQOFECK',
  [RotorType.VI]:  'JPGVOUMFYQBENHZRDKASXLICTW', // M3 specific
  [RotorType.VII]: 'NZJHGRCXMYSWBOUFAIVLPEKQDT', // M3 specific
};

export const ROTOR_NOTCH_LATIN: Record<RotorType, string> = {
  [RotorType.I]:   'Q',
  [RotorType.II]:  'E',
  [RotorType.III]: 'V',
  [RotorType.IV]:  'J',
  [RotorType.V]:   'Z',
  [RotorType.VI]:  'ZM',
  [RotorType.VII]: 'ZM',
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
  // Reusing I and II logic for placeholders for VI/VII if needed, or strictly limit Cyrillic to 5.
  // We will limit Cyrillic model to 5 rotors in specs.
  [RotorType.VI]:  'ФҲГЖДЛОРПАВЫЯЧСМИТЬБЮЭЪЁНКУЦЙЗХЩЎҒҚ.ШЕ', // Placeholder
  [RotorType.VII]: 'ЯЧСМИТЬБЮФЫВАПРОЛДЖЭЪЁНКУЦЙЗХГШЩ.ЎҚҒҲЕ', // Placeholder
};

export const ROTOR_NOTCH_CYRILLIC: Record<RotorType, string> = {
  [RotorType.I]:   'Р',
  [RotorType.II]:  'Ж',
  [RotorType.III]: 'Я',
  [RotorType.IV]:  'К',
  [RotorType.V]:   'М',
  [RotorType.VI]:  'А',
  [RotorType.VII]: 'А',
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
