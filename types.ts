
export enum RotorType {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
  VI = 'VI',
  VII = 'VII',
  K_I = 'K_I',
  K_II = 'K_II',
  K_III = 'K_III',
  K_IV = 'K_IV',
  K_V = 'K_V'
}

export type AlphabetMode = 'latin' | 'cyrillic';

export type EnigmaModel = 'enigma-i' | 'enigma-m3' | 'enigma-k' | 'enigma-uz';

export interface RotorSettings {
  type: RotorType;
  position: number; // Index in the alphabet
  ringSetting: number; // Index in the alphabet
}

export interface EnigmaConfig {
  model: EnigmaModel;
  mode: AlphabetMode;
  rotors: [RotorSettings, RotorSettings, RotorSettings]; // Left, Middle, Right
  reflector: string;
  plugboard: Record<string, string>;
}

export interface AnalysisResult {
  securityLevel: string;
  summary: string;
  tone: string;
}

// Telegram Web App Global Declaration
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        themeParams: any;
      };
    };
  }
}