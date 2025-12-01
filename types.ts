
export enum RotorType {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
  VI = 'VI',
  VII = 'VII'
}

export type AlphabetMode = 'latin' | 'cyrillic';

export type EnigmaModel = 'enigma-i' | 'enigma-m3' | 'enigma-uz';

export interface RotorSettings {
  type: RotorType;
  position: number; // Index in the alphabet
  ringSetting: number; // Index in the alphabet
}

export interface EnigmaConfig {
  model: EnigmaModel;
  mode: AlphabetMode;
  rotors: [RotorSettings, RotorSettings, RotorSettings]; // Left, Middle, Right
  reflector: 'B' | 'C';
  plugboard: Record<string, string>;
}

export interface AnalysisResult {
  securityLevel: string;
  summary: string;
  tone: string;
}
