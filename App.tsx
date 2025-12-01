
import React, { useState, useEffect, useRef } from 'react';
import { EnigmaConfig, AlphabetMode, EnigmaModel, RotorType } from './types';
import { INITIAL_CONFIG_LATIN, INITIAL_CONFIG_CYRILLIC, ALPHABET_LATIN, ALPHABET_CYRILLIC, MACHINE_SPECS } from './constants';
import { encryptCharacter, encryptMessage } from './services/enigmaLogic';
import { generateDailyKey, analyzeSecurity, explainEnigma } from './services/geminiService';
import RotorUnit from './components/RotorUnit';
import Lampboard from './components/Lampboard';
import Plugboard from './components/Plugboard';

const STORAGE_KEY = 'enigma_config_v2';

const App: React.FC = () => {
  // Initialize state from local storage or defaults
  const [config, setConfig] = useState<EnigmaConfig>(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error("Invalid config in storage", e);
      }
    }
    return INITIAL_CONFIG_LATIN;
  });

  const [inputMode, setInputMode] = useState<'typewriter' | 'paste'>('typewriter');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [litChar, setLitChar] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoText, setInfoText] = useState('');
  const [copied, setCopied] = useState(false);

  const liveConfigRef = useRef<EnigmaConfig>(config);
  
  // Current machine specification based on selected model
  const currentSpec = MACHINE_SPECS[config.model];
  const mode = config.mode;

  // Sync ref with state
  useEffect(() => {
    liveConfigRef.current = config;
  }, [config]);

  // Persist Config to Local Storage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Handle Model Change
  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value as EnigmaModel;
    const newSpec = MACHINE_SPECS[newModelId];

    // Determine default rotors for the new model
    // If previous rotors are valid in new model, keep them (positions), otherwise reset to Rotor I
    const validRotors = newSpec.allowedRotors;
    const newRotors = config.rotors.map(r => {
        if (validRotors.includes(r.type)) {
            return { ...r };
        }
        return { type: validRotors[0], position: 0, ringSetting: 0 };
    }) as [any, any, any];

    const newConfig: EnigmaConfig = {
        model: newModelId,
        mode: newSpec.mode,
        rotors: newRotors,
        reflector: newSpec.allowedReflectors.includes(config.reflector) ? config.reflector : newSpec.allowedReflectors[0] as any,
        plugboard: {} // Reset plugboard on model switch to avoid alphabet clashes
    };

    setConfig(newConfig);
    setInputText('');
    setOutputText('');
    setAiAnalysis('');
  };

  const handleRotorChange = (index: number, newSettings: any) => {
    const newRotors = [...config.rotors] as [any, any, any];
    newRotors[index] = newSettings;
    setConfig({ ...config, rotors: newRotors });
  };

  const handleReflectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newReflector = e.target.value as 'B' | 'C';
      setConfig({ ...config, reflector: newReflector });
  };

  const handlePlugboardConnect = (char1: string, char2: string) => {
    if (char1 === char2) return;
    const newPlugboard = { ...config.plugboard };
    
    // Remove any existing connections for these chars
    if (newPlugboard[char1]) {
        const oldPartner = newPlugboard[char1];
        delete newPlugboard[oldPartner];
    }
    if (newPlugboard[char2]) {
        const oldPartner = newPlugboard[char2];
        delete newPlugboard[oldPartner];
    }

    // Add new connection
    newPlugboard[char1] = char2;
    newPlugboard[char2] = char1;

    setConfig({ ...config, plugboard: newPlugboard });
  };

  const handlePlugboardDisconnect = (char: string) => {
    const partner = config.plugboard[char];
    if (!partner) return;

    const newPlugboard = { ...config.plugboard };
    delete newPlugboard[char];
    delete newPlugboard[partner];

    setConfig({ ...config, plugboard: newPlugboard });
  };

  const currentAlphabet = mode === 'cyrillic' ? ALPHABET_CYRILLIC : ALPHABET_LATIN;

  const handleTypewriterInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (inputMode !== 'typewriter') return;
    
    const char = e.key.toUpperCase();
    
    // Check if char is in valid alphabet
    if (currentAlphabet.includes(char) && !e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
      e.preventDefault();
      
      const { char: encryptedChar, newConfig } = encryptCharacter(char, liveConfigRef.current);
      
      setConfig(newConfig);
      setInputText(prev => prev + char);
      setOutputText(prev => prev + encryptedChar);
      
      setLitChar(encryptedChar);
      setTimeout(() => setLitChar(null), 300);
    } else if (e.key === 'Backspace') {
       if (inputText.length > 0) {
         setInputText(prev => prev.slice(0, -1));
         setOutputText(prev => prev.slice(0, -1));
       }
    } else if (e.key === ' ') {
        e.preventDefault();
        setInputText(prev => prev + ' ');
        setOutputText(prev => prev + ' ');
    }
  };

  const handlePasteMode = () => {
    const result = encryptMessage(inputText.toUpperCase(), config);
    setOutputText(result);
  };

  const handleGenDailyKey = async () => {
    setAiLoading(true);
    
    const generatedConfig = await generateDailyKey(mode);
    
    if (generatedConfig) {
      // Merge generated rotors/plugs into current model
      setConfig(prev => ({
          ...prev,
          rotors: generatedConfig.rotors,
          reflector: generatedConfig.reflector,
          plugboard: generatedConfig.plugboard
      }));
    } else {
      // Fallback if AI fails: Reset to random internal positions.
      const rand = (n: number) => Math.floor(Math.random() * n);
      const mod = mode === 'cyrillic' ? 36 : 26;
      
      const newConfig = JSON.parse(JSON.stringify(config)) as EnigmaConfig;
      newConfig.rotors = newConfig.rotors.map(r => ({
        ...r,
        position: rand(mod),
        ringSetting: rand(mod)
      })) as [any, any, any];
      
      setConfig(newConfig);
    }
    setAiLoading(false);
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    const res = await analyzeSecurity(outputText || inputText);
    setAiAnalysis(res);
    setAiLoading(false);
  };

  const handleExplain = async () => {
      setShowInfo(true);
      if(!infoText) {
          setAiLoading(true);
          const text = await explainEnigma();
          setInfoText(text);
          setAiLoading(false);
      }
  }

  const handleCopy = () => {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  const handleDownload = () => {
      const element = document.createElement("a");
      const file = new Blob([outputText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "enigma_msg.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  }

  const handleReset = () => {
      // Reset to defaults for current model
      const base = config.model === 'enigma-uz' ? INITIAL_CONFIG_CYRILLIC : INITIAL_CONFIG_LATIN;
      setConfig({
          ...base,
          model: config.model // Keep current model
      });
      setInputText('');
      setOutputText('');
      setAiAnalysis('');
  };

  const switchInputMode = (newMode: 'typewriter' | 'paste') => {
      setInputMode(newMode);
      setInputText('');
      setOutputText('');
  }

  return (
    <div className="min-h-screen bg-military-900 text-gray-200 font-sans selection:bg-neon-green selection:text-black pb-20">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-neon-green flex items-center justify-center text-black font-bold font-mono text-xl">E</div>
             <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-wider uppercase text-white leading-none">Enigma <span className="text-neon-green">Pro</span></h1>
                <span className="text-[10px] text-gray-500 tracking-widest uppercase">Maxfiy Aloqa Tizimi</span>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             <div className="flex flex-col items-end mr-2">
                 <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Model</label>
                 <select 
                    value={config.model} 
                    onChange={handleModelSelect}
                    className="bg-gray-900 border border-gray-700 text-white text-xs font-bold rounded px-2 py-1 outline-none focus:border-neon-green"
                 >
                     {Object.values(MACHINE_SPECS).map(spec => (
                         <option key={spec.id} value={spec.id}>{spec.name}</option>
                     ))}
                 </select>
             </div>

            <button 
                onClick={handleExplain}
                className="px-3 py-1 text-xs border border-gray-600 rounded hover:bg-gray-800 transition-colors hidden md:block">
                Tarix
            </button>
            <button 
                onClick={handleGenDailyKey}
                disabled={aiLoading}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-neon-green/10 text-neon-green border border-neon-green/30 rounded hover:bg-neon-green/20 transition-colors">
                {aiLoading ? '...' : '⚡ Avto-Kalit'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 flex flex-col gap-6">
        
        {/* Info Modal */}
        {showInfo && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 relative animate-fade-in shadow-2xl">
                <button onClick={() => setShowInfo(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">✕</button>
                <h3 className="font-bold text-neon-green mb-2 text-lg">Enigma Tarixi va Ishlashi</h3>
                <p className="text-sm text-gray-300 leading-relaxed font-mono">
                    {infoText || "Ma'lumot yuklanmoqda..."}
                </p>
            </div>
        )}

        {/* Machine Visualization Area */}
        <section className="bg-black/40 p-4 md:p-8 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-2xl relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row gap-8 justify-center items-center">
                {/* Rotors */}
                <div className="flex flex-col items-center">
                    <div className="flex gap-2 md:gap-4 bg-black p-4 md:p-6 rounded-xl border border-gray-700 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
                        {config.rotors.map((settings, index) => (
                            <RotorUnit 
                                key={index}
                                mode={mode} 
                                label={index === 0 ? "I - Chap" : index === 1 ? "II - O'rta" : "III - O'ng"} 
                                settings={settings} 
                                onChange={(s) => handleRotorChange(index, s)}
                                allowedRotors={currentSpec.allowedRotors}
                            />
                        ))}
                    </div>
                    <div className="mt-4 flex gap-4 text-xs font-mono text-gray-500 items-center justify-between w-full px-2">
                        <div className="flex items-center gap-2">
                            <span>Reflektor:</span>
                            <select 
                                value={config.reflector} 
                                onChange={handleReflectorChange}
                                className="bg-military-800 text-gray-300 border border-gray-600 rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                                {currentSpec.allowedReflectors.map(r => (
                                    <option key={r} value={r}>UKW-{r}</option>
                                ))}
                            </select>
                        </div>
                        <span className="text-[10px] text-gray-600 border border-gray-800 px-2 py-0.5 rounded">
                            {currentSpec.description.split(' ').slice(0, 4).join(' ')}...
                        </span>
                    </div>
                </div>
                
                {/* Lampboard */}
                <div className="flex-1 w-full max-w-2xl">
                    <Lampboard litChar={litChar} mode={mode} />
                </div>
            </div>
        </section>

        {/* Plugboard Section */}
        <section>
            <Plugboard 
                plugboard={config.plugboard} 
                mode={mode}
                onConnect={handlePlugboardConnect}
                onDisconnect={handlePlugboardDisconnect}
            />
        </section>

        {/* Input/Output Area */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input Column */}
            <div className="flex flex-col gap-2">
                {/* Mode Tabs */}
                <div className="flex rounded-lg bg-military-800 p-1 border border-gray-700 w-fit">
                     <button 
                        onClick={() => switchInputMode('typewriter')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${inputMode === 'typewriter' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                     >
                        TYPEWRITER (JONLI)
                     </button>
                     <button 
                        onClick={() => switchInputMode('paste')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${inputMode === 'paste' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                     >
                        PASTE (MATN)
                     </button>
                </div>

                {/* Input Card */}
                <div className="bg-military-800 rounded-xl p-1 border border-military-500 shadow-lg flex flex-col h-80 group focus-within:border-emerald-500 transition-colors relative">
                    <div className="bg-military-900 rounded-t-lg p-3 flex justify-between items-center border-b border-military-500">
                        <label className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${inputMode === 'typewriter' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`}></span>
                            {inputMode === 'typewriter' ? 'Jonli Kiritish' : 'Matn Kiritish'}
                        </label>
                        <button 
                            onClick={() => { setInputText(''); setOutputText(''); }}
                            className="text-[10px] text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-800"
                        >
                            TOZALASH
                        </button>
                    </div>
                    <div className="flex-1 p-4 relative">
                        <textarea 
                            value={inputText}
                            onChange={(e) => {
                                // Convert to upper case automatically for better UX
                                setInputText(e.target.value.toUpperCase());
                            }}
                            onKeyDown={handleTypewriterInput}
                            placeholder={inputMode === 'typewriter' ? (mode === 'cyrillic' ? "Kirill alifbosida yozing..." : "Type here to encrypt...") : "Matnni shu yerga tashlang..."}
                            className="w-full h-full bg-transparent resize-none outline-none font-mono text-emerald-400 placeholder-gray-700 text-sm md:text-base leading-relaxed"
                            spellCheck={false}
                        />
                    </div>
                    {inputMode === 'paste' && (
                        <div className="p-2 border-t border-military-500 bg-military-900/50">
                            <button 
                                onClick={handlePasteMode}
                                disabled={!inputText}
                                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-sm transition-all shadow-lg active:transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>⚙️</span> SHIFRLASH / DESHIFRLASH
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Column */}
            <div className="flex flex-col gap-2">
                 {/* Spacer for Tabs alignment */}
                 <div className="h-[34px] hidden md:block"></div> 

                <div className="bg-military-800 rounded-xl p-1 border border-military-500 shadow-lg flex flex-col h-80 relative overflow-hidden">
                    <div className="bg-military-900 rounded-t-lg p-3 flex justify-between items-center border-b border-military-500 z-10">
                        <label className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Shifrlangan Matn
                        </label>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleAnalyze}
                                disabled={!outputText || aiLoading}
                                className="text-[10px] bg-indigo-900/50 px-2 py-1 rounded text-indigo-300 border border-indigo-800 hover:bg-indigo-800 transition-colors disabled:opacity-30"
                            >
                                AI TAHLIL
                            </button>
                            <button 
                                onClick={handleDownload}
                                disabled={!outputText}
                                className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-300 border border-gray-600 hover:bg-gray-700 disabled:opacity-30"
                            >
                                TXT YUKLASH
                            </button>
                            <button 
                                onClick={handleCopy}
                                className={`text-[10px] px-2 py-1 rounded border transition-colors ${copied ? 'bg-green-900 border-green-700 text-green-300' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {copied ? 'NUSXALANDI!' : 'NUSXA OLISH'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-auto font-mono text-amber-500 text-sm md:text-base break-all bg-black/20 z-10">
                        {outputText || <span className="text-gray-700 opacity-50 italic">Natija kutilmoqda...</span>}
                    </div>

                    {/* Decorative BG Element */}
                    <div className="absolute -bottom-10 -right-10 text-gray-800/20 pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                    </div>
                </div>
            </div>

        </section>

        {/* AI Analysis Result */}
        {aiAnalysis && (
            <section className="bg-gray-800/80 border-l-4 border-neon-amber p-6 rounded shadow-lg animate-fade-in mb-8">
                <h3 className="text-neon-amber font-bold mb-3 flex items-center gap-2 border-b border-gray-700 pb-2">
                    <span className="text-xl">📊</span> Xavfsizlik va Mazmun Tahlili
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-line font-mono leading-relaxed">
                    {aiAnalysis}
                </p>
            </section>
        )}
        
        {/* Footer Actions */}
        <div className="flex justify-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
             <button onClick={handleReset} className="text-gray-500 hover:text-red-500 text-xs transition-colors uppercase tracking-widest border-b border-transparent hover:border-red-500 pb-1">
                 Tizimni Tozalash (Reset)
             </button>
        </div>

      </main>
    </div>
  );
};

export default App;
