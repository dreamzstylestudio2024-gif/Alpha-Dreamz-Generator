import React, { useState } from 'react';
import { 
  Users, Wand2, Image as ImageIcon, Layers, Zap, Shuffle, 
  MonitorPlay, Download, RefreshCw, PenTool, Hexagon,
  Diamond, Crown, MapPin, Shirt, Car, Wine, Sparkles
} from 'lucide-react';
import UploadZone from './UploadZone';
import { StudioState, INITIAL_STUDIO_STATE, AspectRatio, GeneratedContent, LuxuryState, INITIAL_LUXURY_STATE } from '../types';
import { enhancePrompt, getRandomUGCPrompt, generateStudioImage, generateLogo, generateLuxuryImage } from '../services/geminiService';

const StudioMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Standard' | 'Luxury'>('Standard');
  const [studioState, setStudioState] = useState<StudioState>(INITIAL_STUDIO_STATE);
  const [luxuryState, setLuxuryState] = useState<LuxuryState>(INITIAL_LUXURY_STATE);
  const [generated, setGenerated] = useState<GeneratedContent>({ loading: false });
  const [isEnhancing, setIsEnhancing] = useState(false);

  const updateStudioState = (key: keyof StudioState, value: any) => {
    setStudioState(prev => ({ ...prev, [key]: value }));
  };
  const updateLuxuryState = (key: keyof LuxuryState, value: any) => {
    setLuxuryState(prev => ({ ...prev, [key]: value }));
  };

  const handleEnhance = async () => {
    if (!studioState.prompt) return;
    setIsEnhancing(true);
    const newPrompt = await enhancePrompt(studioState.prompt);
    updateStudioState('prompt', newPrompt);
    setIsEnhancing(false);
  };

  const handleRandomPrompt = async () => {
    const prompt = await getRandomUGCPrompt();
    updateStudioState('prompt', prompt);
  };

  const handleStandardGenerate = async () => {
    setGenerated({ loading: true, error: undefined, studioImages: [], logoUrl: undefined });
    try {
      if (studioState.tool === 'Image') {
        const images = await generateStudioImage(studioState);
        setGenerated({ loading: false, studioImages: images });
      } else {
        const logo = await generateLogo(studioState);
        setGenerated({ loading: false, logoUrl: logo });
      }
    } catch (e: any) {
      setGenerated({ loading: false, error: e.message || "Failed to generate" });
    }
  };

  const handleLuxuryGenerate = async () => {
    setGenerated({ loading: true, error: undefined, avatarUrl: undefined, logoUrl: undefined });
    try {
      const url = await generateLuxuryImage(luxuryState);
      setGenerated({ loading: false, avatarUrl: url });
    } catch (e: any) {
      setGenerated({ loading: false, error: e.message || "Failed to generate luxury content" });
    }
  };

  const handleLuxuryLogoGenerate = async () => {
    if (!luxuryState.brandName) {
        setGenerated(prev => ({ ...prev, error: "Brand Name is required for logo generation" }));
        return;
    }
    setGenerated(prev => ({ ...prev, loading: true, error: undefined, logoUrl: undefined }));
    try {
        const logoState: any = {
            logoBrand: luxuryState.brandName,
            logoTagline: luxuryState.tagline,
            logoIndustry: luxuryState.industry,
            logoStyle: luxuryState.style
        };
        const url = await generateLogo(logoState);
        setGenerated(prev => ({ ...prev, loading: false, logoUrl: url }));
    } catch (e: any) {
        setGenerated(prev => ({ ...prev, loading: false, error: e.message }));
    }
  };

  const Select = ({ label, value, onChange, options, icon: Icon }: any) => (
    <div className="mb-4">
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-rose-400" />} {label}
      </label>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2.5 text-xs text-stone-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none shadow-sm hover:border-rose-300"
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-rose-50/30 text-stone-700">
      
      {/* Top Toggle Bar */}
      <div className="h-14 border-b border-rose-100 bg-white/60 backdrop-blur-md flex items-center justify-center gap-6 shadow-sm z-20">
          <button 
             onClick={() => { setActiveTab('Standard'); setGenerated({ loading: false }); }}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                 activeTab === 'Standard' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-stone-400 hover:text-rose-500 hover:bg-white'
             }`}
          >
             <Layers className="w-3 h-3" /> Standard Studio
          </button>
          <button 
             onClick={() => { setActiveTab('Luxury'); setGenerated({ loading: false }); }}
             className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                 activeTab === 'Luxury' ? 'bg-amber-400 text-white shadow-lg shadow-amber-100' : 'text-stone-400 hover:text-amber-500 hover:bg-white'
             }`}
          >
             <Diamond className="w-3 h-3" /> Luxury Suite
          </button>
      </div>

      {activeTab === 'Standard' ? (
        /* ================= STANDARD STUDIO UI ================= */
        <div className="flex flex-1 overflow-hidden">
             {/* COLUMN 1: CASTING */}
            <div className={`w-80 border-r border-rose-100 bg-white/60 backdrop-blur flex flex-col overflow-y-auto custom-scrollbar transition-opacity ${studioState.tool === 'Logo' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="p-5 border-b border-rose-100">
                  <h2 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> 1. CASTING
                  </h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Subject & Reference</p>
                </div>
                
                <div className="p-5 space-y-6">
                  <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Subject Type</label>
                      <div className="flex bg-rose-50/50 p-1 rounded-xl border border-rose-100">
                      {['Person', 'Object'].map((type) => (
                          <button
                          key={type}
                          onClick={() => updateStudioState('subjectType', type)}
                          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${
                              studioState.subjectType === type 
                              ? 'bg-white text-rose-600 shadow-sm border border-rose-50' 
                              : 'text-stone-400 hover:text-rose-400'
                          }`}
                          >
                          {type}
                          </button>
                      ))}
                      </div>
                  </div>

                  <UploadZone 
                      label="Subject Photo" 
                      file={studioState.subjectImage} 
                      onFileSelect={(f) => updateStudioState('subjectImage', f)} 
                  />
                  
                  <UploadZone 
                      label="Style Reference" 
                      file={studioState.styleReference} 
                      onFileSelect={(f) => updateStudioState('styleReference', f)} 
                  />
                </div>
            </div>

            {/* COLUMN 2: CREATIVE DIRECTION & PREVIEW */}
            <div className="flex-1 flex flex-col border-r border-rose-100 bg-gradient-to-br from-stone-50 to-white relative">
                <div className="p-4 border-b border-rose-100 bg-white/50 backdrop-blur flex items-center justify-between">
                  <div>
                      <h2 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" /> 2. CREATIVE DIRECTION
                      </h2>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Prompt & Design</p>
                  </div>
                  
                  <div className="flex bg-rose-50 p-1 rounded-lg border border-rose-100">
                      <button
                          onClick={() => updateStudioState('tool', 'Image')}
                          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${
                          studioState.tool === 'Image' 
                              ? 'bg-white text-rose-600 shadow-sm' 
                              : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                      <ImageIcon className="w-3 h-3" /> Image
                      </button>
                      <button
                          onClick={() => updateStudioState('tool', 'Logo')}
                          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${
                          studioState.tool === 'Logo' 
                              ? 'bg-white text-rose-600 shadow-sm' 
                              : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                      <Hexagon className="w-3 h-3" /> Logo Studio
                      </button>
                  </div>
                </div>

                <div className="p-8 flex flex-col h-full">
                  {studioState.tool === 'Image' ? (
                      <div className="mb-6">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Vision Description</label>
                      <textarea 
                          value={studioState.prompt}
                          onChange={(e) => updateStudioState('prompt', e.target.value)}
                          placeholder="Describe the scene, outfit, lighting, and mood..."
                          className="w-full h-24 bg-white border border-rose-100 rounded-xl p-4 text-sm text-stone-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 transition-all resize-none placeholder:text-stone-300 shadow-sm"
                      />
                      
                      <div className="flex gap-3 mt-3">
                          <button 
                          onClick={handleRandomPrompt}
                          className="flex-1 bg-white hover:bg-stone-50 text-stone-500 py-2 px-4 rounded-lg border border-stone-200 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
                          >
                          <Shuffle className="w-3 h-3" /> Random Prompt
                          </button>
                          <button 
                          onClick={handleEnhance}
                          disabled={isEnhancing}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
                          >
                          <Zap className="w-3 h-3" /> {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                          </button>
                      </div>
                      </div>
                  ) : (
                      <div className="mb-6 bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-6 text-rose-500 text-sm font-bold uppercase tracking-wider border-b border-rose-50 pb-3">
                          <Hexagon className="w-4 h-4" /> Logo Design Studio
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">Brand Name</label>
                              <input 
                              type="text" 
                              value={studioState.logoBrand} 
                              onChange={(e) => updateStudioState('logoBrand', e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:border-rose-400 outline-none" 
                              placeholder="e.g. Alpha Dreamz"
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">Tagline</label>
                              <input 
                              type="text" 
                              value={studioState.logoTagline} 
                              onChange={(e) => updateStudioState('logoTagline', e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:border-rose-400 outline-none" 
                              placeholder="e.g. The Future of AI"
                              />
                          </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">Industry</label>
                              <input 
                              type="text" 
                              value={studioState.logoIndustry} 
                              onChange={(e) => updateStudioState('logoIndustry', e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:border-rose-400 outline-none" 
                              placeholder="e.g. Technology"
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">Style</label>
                              <input 
                              type="text" 
                              value={studioState.logoStyle} 
                              onChange={(e) => updateStudioState('logoStyle', e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 focus:border-rose-400 outline-none" 
                              placeholder="e.g. Minimalist, Cyberpunk"
                              />
                          </div>
                          </div>
                      </div>
                  )}

                  {/* Results Area */}
                  <div className="flex-1 bg-stone-100 rounded-xl border border-stone-200 overflow-hidden relative shadow-inner">
                      {generated.loading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <RefreshCw className="w-10 h-10 text-rose-400 animate-spin mb-4" />
                          <p className="text-sm font-bold text-rose-400 animate-pulse tracking-widest">
                              {studioState.tool === 'Image' ? "RENDERING..." : "DESIGNING LOGO..."}
                          </p>
                          </div>
                      ) : (studioState.tool === 'Image' && generated.studioImages && generated.studioImages.length > 0) ? (
                          <div className={`w-full h-full p-6 grid gap-6 overflow-y-auto ${
                          generated.studioImages.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-2'
                          }`}>
                          {generated.studioImages.map((img, idx) => (
                              <div key={idx} className="relative group rounded-xl overflow-hidden border-4 border-white shadow-lg bg-white max-h-full">
                              <img src={img} alt={`Result ${idx}`} className="max-w-full max-h-full object-contain" />
                              <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                  <button className="p-3 bg-white text-rose-500 rounded-full hover:scale-110 transition-transform shadow-lg">
                                  <Download className="w-5 h-5" />
                                  </button>
                              </div>
                              </div>
                          ))}
                          </div>
                      ) : (studioState.tool === 'Logo' && generated.logoUrl) ? (
                          <div className="w-full h-full p-8 flex items-center justify-center">
                              <div className="relative group rounded-2xl overflow-hidden border border-rose-100 shadow-xl bg-white max-h-full aspect-square flex items-center justify-center p-10">
                                  <img src={generated.logoUrl} alt="Logo Result" className="w-full h-full object-contain" />
                                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                    <button className="p-3 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                                        <Download className="w-5 h-5" />
                                    </button>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300">
                          {studioState.tool === 'Image' ? (
                              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                          ) : (
                              <Hexagon className="w-16 h-16 mb-4 opacity-50" />
                          )}
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
                              {studioState.tool === 'Image' ? "No Prints Generated" : "No Design Generated"}
                          </p>
                          </div>
                      )}
                      
                      {generated.error && (
                          <div className="absolute inset-x-0 bottom-0 bg-rose-100 p-2 text-center text-xs text-rose-600 font-bold border-t border-rose-200">
                          {generated.error}
                          </div>
                      )}
                  </div>
                </div>
            </div>

            {/* COLUMN 3: FORMAT & OUTPUT */}
            <div className="w-80 border-l border-rose-100 bg-white/60 backdrop-blur flex flex-col overflow-y-auto custom-scrollbar">
                <div className="p-5 border-b border-rose-100">
                  <h2 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> 3. FORMAT & OUTPUT
                  </h2>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Setting & Generation</p>
                </div>

                <div className="p-5 space-y-6">
                  {studioState.tool === 'Image' && (
                      <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Batch Count</label>
                          <select 
                          value={studioState.batchCount}
                          onChange={(e) => updateStudioState('batchCount', parseInt(e.target.value))}
                          className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-sm text-stone-700 focus:border-rose-400 outline-none shadow-sm"
                          >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={4}>4</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Composition</label>
                          <select 
                          value={studioState.composition}
                          onChange={(e) => updateStudioState('composition', e.target.value)}
                          className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-sm text-stone-700 focus:border-rose-400 outline-none shadow-sm"
                          >
                          <option value="Close Up">Close Up</option>
                          <option value="Waist Shot">Waist Shot</option>
                          <option value="Full Body">Full Body</option>
                          <option value="Extreme Long Shot">Extreme Long Shot</option>
                          <option value="Macro Detail">Macro Detail</option>
                          </select>
                      </div>
                      </div>
                  )}

                  <div className={studioState.tool === 'Logo' ? 'opacity-50 pointer-events-none' : ''}>
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block">Aspect Ratio</label>
                      <div className="grid grid-cols-3 gap-2">
                          {[
                          { label: 'Portrait', value: AspectRatio.Ratio_9_16 },
                          { label: 'Social', value: AspectRatio.Ratio_4_5 },
                          { label: 'Classic', value: AspectRatio.Ratio_3_4 },
                          { label: 'Square', value: AspectRatio.Ratio_1_1 },
                          { label: 'Land', value: AspectRatio.Ratio_16_9 },
                          ].map((ratio) => (
                          <button
                              key={ratio.label}
                              onClick={() => updateStudioState('aspectRatio', ratio.value)}
                              className={`py-2 text-[10px] uppercase font-bold border rounded-lg transition-all ${
                              studioState.aspectRatio === ratio.value 
                                  ? 'bg-rose-50 text-rose-600 border-rose-300' 
                                  : 'bg-white text-stone-400 border-stone-100 hover:border-rose-200'
                              }`}
                          >
                              {ratio.label}
                          </button>
                          ))}
                      </div>
                  </div>

                  {studioState.tool === 'Image' && (
                      <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-500">Face Match</span>
                            <button 
                                onClick={() => updateStudioState('faceMatch', !studioState.faceMatch)}
                                className={`w-9 h-5 rounded-full relative transition-colors shadow-inner ${studioState.faceMatch ? 'bg-rose-400' : 'bg-stone-300'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${studioState.faceMatch ? 'left-5' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-500">Tone Match</span>
                            <button 
                                onClick={() => updateStudioState('toneMatch', !studioState.toneMatch)}
                                className={`w-9 h-5 rounded-full relative transition-colors shadow-inner ${studioState.toneMatch ? 'bg-rose-400' : 'bg-stone-300'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${studioState.toneMatch ? 'left-5' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-500">Body Match</span>
                            <button 
                                onClick={() => updateStudioState('bodyMatch', !studioState.bodyMatch)}
                                className={`w-9 h-5 rounded-full relative transition-colors shadow-inner ${studioState.bodyMatch ? 'bg-rose-400' : 'bg-stone-300'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${studioState.bodyMatch ? 'left-5' : 'left-1'}`} />
                            </button>
                        </div>
                      </div>
                  )}

                  <button 
                      onClick={handleStandardGenerate}
                      disabled={generated.loading}
                      className="w-full py-4 bg-gradient-to-r from-rose-400 to-rose-600 hover:from-rose-500 hover:to-rose-700 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-rose-200 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                      {generated.loading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (studioState.tool === 'Image' ? <MonitorPlay className="w-5 h-5" /> : <PenTool className="w-5 h-5" />)}
                      
                      {studioState.tool === 'Image' ? `Generate ${studioState.batchCount} Print${studioState.batchCount > 1 ? 's' : ''}` : 'Generate Logo'}
                  </button>
                </div>
            </div>
        </div>
      ) : (
        /* ================= LUXURY SUITE UI ================= */
        <div className="flex flex-1 overflow-hidden">
            <div className="w-80 bg-white/60 border-r border-rose-100 overflow-y-auto custom-scrollbar p-5">
                <div className="mb-6 pb-4 border-b border-rose-100">
                <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-1">
                    <Diamond className="w-4 h-4" /> LUXURY SETTINGS
                </h2>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">Editorial Configuration</p>
                </div>

                <Select 
                label="Visual Theme" 
                icon={Crown}
                value={luxuryState.visualTheme} 
                onChange={(v: string) => updateLuxuryState('visualTheme', v)} 
                options={['High Fashion Editorial', 'Old Money Aesthetic', 'Futuristic Luxury', 'Royal Elegance', 'Minimalist Chic']} 
                />
                <Select 
                label="Location / Setting" 
                icon={MapPin}
                value={luxuryState.location} 
                onChange={(v: string) => updateLuxuryState('location', v)} 
                options={['Parisian Balcony', 'Private Jet Interior', 'Milan Fashion Week', 'Luxury Yacht', 'Penthouse NYC', 'Monaco Casino']} 
                />
                <Select 
                label="Brand Inspiration" 
                icon={Diamond}
                value={luxuryState.brandInspiration} 
                onChange={(v: string) => updateLuxuryState('brandInspiration', v)} 
                options={['Chanel', 'Gucci', 'Versace', 'Louis Vuitton', 'Hermes', 'Prada', 'Balenciaga']} 
                />

                <div className="mt-6 pt-4 border-t border-rose-100">
                <h3 className="text-xs font-bold text-stone-500 mb-4 uppercase tracking-wider">Character Details</h3>
                
                <div className="mb-4">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> AI Character Prompt
                    </label>
                    <textarea 
                    value={luxuryState.customPrompt || ''}
                    onChange={(e) => updateLuxuryState('customPrompt', e.target.value)}
                    className="w-full h-24 bg-white border border-rose-100 rounded-xl p-3 text-xs text-stone-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors resize-none placeholder:text-stone-300"
                    placeholder="Describe specific facial features..."
                    />
                </div>

                <Select label="Wardrobe" icon={Shirt} value={luxuryState.wardrobe} onChange={(v: string) => updateLuxuryState('wardrobe', v)} options={['Haute Couture Gown', 'Tailored Bespoke Suit', 'Designer Streetwear', 'Avant-Garde Piece']} />
                <Select label="Footwear" value={luxuryState.footwear} onChange={(v: string) => updateLuxuryState('footwear', v)} options={['Designer Stilettos', 'Luxury Loafers', 'High-End Sneakers', 'Leather Boots']} />
                <Select label="Pose" value={luxuryState.pose} onChange={(v: string) => updateLuxuryState('pose', v)} options={['Power Stance', 'Relaxed Elegance', 'Walking Away', 'Over Shoulder']} />
                </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-stone-100 to-white relative flex flex-col items-center justify-center p-8">
                <div className="relative aspect-[9/16] h-full max-h-[700px] border-8 border-white bg-white shadow-2xl overflow-hidden flex items-center justify-center rounded-sm">
                    {generated.loading ? (
                        <div className="flex flex-col items-center text-amber-500 animate-pulse">
                            <Diamond className="w-12 h-12 mb-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Designing Luxury Asset...</span>
                        </div>
                    ) : generated.avatarUrl ? (
                        <img src={generated.avatarUrl} alt="Luxury Result" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-stone-300 flex flex-col items-center">
                            <Crown className="w-20 h-20 mb-4 opacity-50" />
                            <p className="text-xs tracking-widest uppercase font-bold text-stone-400">Luxury Mode</p>
                        </div>
                    )}
                    
                    {generated.logoUrl && (
                        <div className="absolute bottom-8 right-8 w-32 h-32 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-xl z-20">
                            <img src={generated.logoUrl} alt="Generated Logo" className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                    )}

                    {generated.error && (
                        <div className="absolute inset-x-0 bottom-0 bg-red-50 text-red-500 text-[10px] p-2 text-center font-bold">
                            {generated.error}
                        </div>
                    )}
                </div>

                <button 
                onClick={handleLuxuryGenerate}
                disabled={generated.loading}
                className="absolute bottom-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-amber-200 flex items-center gap-2 transform hover:scale-105 transition-all uppercase tracking-widest text-xs"
                >
                {generated.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Diamond className="w-4 h-4" />}
                Generate Editorial
                </button>
            </div>

            <div className="w-80 bg-white/60 border-l border-rose-100 flex flex-col">
                <div className="p-5 border-b border-rose-100 bg-amber-50/30">
                    <h2 className="text-sm font-bold text-amber-600 flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> LOGO STUDIO
                    </h2>
                    <p className="text-[10px] text-amber-400 uppercase tracking-widest mt-1">Brand Identity</p>
                </div>
                
                <div className="p-6 space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 block">Brand Name</label>
                        <input 
                        type="text" 
                        value={luxuryState.brandName} 
                        onChange={(e) => updateLuxuryState('brandName', e.target.value)}
                        className="w-full bg-white border border-rose-100 rounded-lg p-3 text-sm text-stone-700 focus:border-amber-400 outline-none shadow-sm" 
                        placeholder="Brand Name"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 block">Tagline</label>
                        <input 
                        type="text" 
                        value={luxuryState.tagline} 
                        onChange={(e) => updateLuxuryState('tagline', e.target.value)}
                        className="w-full bg-white border border-rose-100 rounded-lg p-3 text-sm text-stone-700 focus:border-amber-400 outline-none shadow-sm" 
                        placeholder="Optional Tagline"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 block">Industry</label>
                        <input 
                        type="text" 
                        value={luxuryState.industry} 
                        onChange={(e) => updateLuxuryState('industry', e.target.value)}
                        className="w-full bg-white border border-rose-100 rounded-lg p-3 text-sm text-stone-700 focus:border-amber-400 outline-none shadow-sm" 
                        placeholder="e.g. Fashion, Tech"
                        />
                    </div>
                    
                    <button 
                        onClick={handleLuxuryLogoGenerate}
                        disabled={generated.loading}
                        className="w-full py-3 mt-4 bg-stone-800 hover:bg-stone-900 text-white font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-lg"
                    >
                        Generate Asset
                    </button>
                    
                    {generated.logoUrl && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-rose-100 flex flex-col items-center shadow-sm">
                            <img src={generated.logoUrl} alt="Logo Preview" className="w-24 h-24 object-contain mb-2" />
                            <button className="text-[10px] flex items-center gap-1 text-amber-500 hover:text-amber-600 font-bold uppercase">
                                <Download className="w-3 h-3" /> Download Vector
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudioMode;