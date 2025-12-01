import { GoogleGenAI, Type } from "@google/genai";
import { EnigmaConfig, RotorType, AlphabetMode } from '../types';

// Safe access to environment variable to prevent crash if process is undefined
const getApiKey = () => {
  try {
    // Check various ways API Key might be stored depending on build tool (Vite vs Webpack)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        // @ts-ignore
        return process.env.API_KEY;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    console.warn("Environment variable access failed");
  }
  return null;
};

export const generateDailyKey = async (mode: AlphabetMode): Promise<EnigmaConfig | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
      console.warn("API Key not found. AI features disabled.");
      return null;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const isCyrillic = mode === 'cyrillic';
  const prompt = isCyrillic 
      ? 'Generate a random configuration JSON for a 36-letter Cyrillic Enigma. Include 3 distinct rotors (I-V), positions (0-35), ring settings (0-35), a reflector (B or C), and 10 plugboard pairs. The output must be strictly JSON.'
      : 'Generate a random, valid Enigma I machine configuration JSON. Include 3 distinct rotors (I-V), positions (0-25), ring settings (0-25), a reflector (B or C), and 10 plugboard pairs. The output must be strictly JSON.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rotors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: [RotorType.I, RotorType.II, RotorType.III, RotorType.IV, RotorType.V] },
                  position: { type: Type.INTEGER },
                  ringSetting: { type: Type.INTEGER }
                },
                required: ['type', 'position', 'ringSetting']
              }
            },
            reflector: { type: Type.STRING, enum: ['B', 'C'] },
            plugboardPairs: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Transform plugboard array "AB" to object {'A':'B', 'B':'A'}
    const plugboardObj: Record<string, string> = {};
    if (data.plugboardPairs) {
        data.plugboardPairs.forEach((pair: string) => {
            if(pair.length === 2) {
                const [a, b] = pair.split('');
                plugboardObj[a] = b;
                plugboardObj[b] = a;
            }
        });
    }

    return {
      model: mode === 'cyrillic' ? 'enigma-uz' : 'enigma-i',
      mode: mode,
      rotors: data.rotors,
      reflector: data.reflector,
      plugboard: plugboardObj
    };

  } catch (error) {
    console.error("AI Key Gen Error:", error);
    return null;
  }
};

export const analyzeSecurity = async (message: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) return "API kaliti sozlanmagan (Vercel Environment Variables).";
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this Uzbek text (which might be decrypted): "${message}". 
            1. Summarize the content briefly in Uzbek.
            2. Detect the sentiment/tone.
            3. Give a fun "Security Clearance Level" assessment (e.g. TOP SECRET, PUBLIC, CLASSIFIED).
            Keep it short and professional.`
        });
        return response.text || "Tahlil qilib bo'lmadi.";
    } catch (e) {
        return "Xatolik yuz berdi.";
    }
}

export const explainEnigma = async (): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) return "API kaliti sozlanmagan.";

    const ai = new GoogleGenAI({ apiKey: apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Explain briefly in Uzbek how the Enigma machine works and why it was hard to crack. Use simple analogies. Max 100 words."
        });
        return response.text || "";
    } catch (e) {
        return "Ma'lumot olib bo'lmadi.";
    }
}