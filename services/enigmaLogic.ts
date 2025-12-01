import { EnigmaConfig, RotorType } from '../types';
import { 
  ALPHABET_LATIN, ALPHABET_CYRILLIC,
  ROTOR_WIRING_LATIN, ROTOR_WIRING_CYRILLIC,
  ROTOR_NOTCH_LATIN, ROTOR_NOTCH_CYRILLIC,
  REFLECTORS_LATIN, REFLECTORS_CYRILLIC 
} from '../constants';

const getContext = (mode: 'latin' | 'cyrillic') => {
  if (mode === 'cyrillic') {
    return {
      alphabet: ALPHABET_CYRILLIC,
      wiring: ROTOR_WIRING_CYRILLIC,
      notch: ROTOR_NOTCH_CYRILLIC,
      reflectors: REFLECTORS_CYRILLIC,
      mod: 36
    };
  }
  return {
    alphabet: ALPHABET_LATIN,
    wiring: ROTOR_WIRING_LATIN,
    notch: ROTOR_NOTCH_LATIN,
    reflectors: REFLECTORS_LATIN,
    mod: 26
  };
};

// Helper to simulate signal passing through a rotor
const forwardPass = (index: number, rotorType: RotorType, position: number, ring: number, ctx: any): number => {
  const { wiring, alphabet, mod } = ctx;
  const currentWiring = wiring[rotorType];
  const offset = (position - ring + mod) % mod;
  
  // Enter rotor at (index + offset)
  const entryChar = alphabet[(index + offset) % mod];
  
  // Find mapped char in wiring. If wiring is shorter than mod (safety check), fallback.
  const wiredCharIndex = alphabet.indexOf(entryChar); // This is just identity if wiring was identity.
  // Actually, standard Enigma: Input 'A' (index 0) -> goes to wiring[0].
  
  const wiredChar = currentWiring[alphabet.indexOf(entryChar)];
  
  // Exit rotor accounting for offset
  const exitIndex = (alphabet.indexOf(wiredChar) - offset + mod) % mod;
  return exitIndex;
};

const reversePass = (index: number, rotorType: RotorType, position: number, ring: number, ctx: any): number => {
  const { wiring, alphabet, mod } = ctx;
  const currentWiring = wiring[rotorType];
  const offset = (position - ring + mod) % mod;
  
  // Find which input maps to the current index (shifted)
  const targetChar = alphabet[(index + offset) % mod];
  const wiredIndex = currentWiring.indexOf(targetChar);
  
  const exitIndex = (wiredIndex - offset + mod) % mod;
  return exitIndex;
};

export const encryptCharacter = (char: string, config: EnigmaConfig): { char: string, newConfig: EnigmaConfig } => {
  const ctx = getContext(config.mode);
  const upperChar = char.toUpperCase();
  
  if (!ctx.alphabet.includes(upperChar)) {
    return { char, newConfig: config }; // Return non-alpha chars as is
  }

  // Clone config to modify positions
  const newConfig = JSON.parse(JSON.stringify(config)) as EnigmaConfig;
  const [left, middle, right] = newConfig.rotors;

  // 1. Stepping Mechanism
  let middleStep = false;
  let leftStep = false;

  const rightNotchChar = ctx.notch[right.type];
  const middleNotchChar = ctx.notch[middle.type];

  // Logic: Notches trigger when the rotor moves FROM the notch position.
  // Standard simulation usually checks if we ARE at notch before stepping.
  
  if (ctx.alphabet[middle.position] === middleNotchChar) {
    leftStep = true;
    middleStep = true;
  } else if (ctx.alphabet[right.position] === rightNotchChar) {
     middleStep = true;
  }

  // Execute steps
  right.position = (right.position + 1) % ctx.mod;
  if (middleStep) middle.position = (middle.position + 1) % ctx.mod;
  if (leftStep) left.position = (left.position + 1) % ctx.mod;

  // 2. Plugboard In
  let currentNum = ctx.alphabet.indexOf(upperChar);
  const pluggedCharIn = config.plugboard[upperChar] || upperChar;
  currentNum = ctx.alphabet.indexOf(pluggedCharIn);

  // 3. Right -> Left through Rotors
  currentNum = forwardPass(currentNum, right.type, right.position, right.ringSetting, ctx);
  currentNum = forwardPass(currentNum, middle.type, middle.position, middle.ringSetting, ctx);
  currentNum = forwardPass(currentNum, left.type, left.position, left.ringSetting, ctx);

  // 4. Reflector
  const reflectorWiring = ctx.reflectors[config.reflector];
  const reflectedChar = reflectorWiring[currentNum];
  currentNum = ctx.alphabet.indexOf(reflectedChar);

  // 5. Left -> Right through Rotors
  currentNum = reversePass(currentNum, left.type, left.position, left.ringSetting, ctx);
  currentNum = reversePass(currentNum, middle.type, middle.position, middle.ringSetting, ctx);
  currentNum = reversePass(currentNum, right.type, right.position, right.ringSetting, ctx);

  // 6. Plugboard Out
  const finalCharRaw = ctx.alphabet[currentNum];
  const finalChar = config.plugboard[finalCharRaw] || finalCharRaw;

  return {
    char: finalChar,
    newConfig
  };
};

export const encryptMessage = (text: string, config: EnigmaConfig): string => {
  let tempConfig = JSON.parse(JSON.stringify(config)) as EnigmaConfig;
  let result = '';
  for (const char of text) {
    const res = encryptCharacter(char, tempConfig);
    result += res.char;
    tempConfig = res.newConfig;
  }
  return result;
};