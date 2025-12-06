
import React, { useState } from 'react';
import { 
  Diamond, Crown, MapPin, Shirt, Car, Wine, PenTool, Download, RefreshCw, Sparkles
} from 'lucide-react';
import { LuxuryState, INITIAL_LUXURY_STATE, GeneratedContent } from '../types';
import { generateLuxuryImage, generateLogo } from '../services/geminiService';

const LuxuryMode: React.FC = () => {
  const [state, setState] = useState<LuxuryState>(INITIAL_LUXURY_STATE);
  const [generated, setGenerated] = useState<GeneratedContent>({ loading: false });

  const updateState = (key: keyof LuxuryState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerated({ loading: true, error: undefined, avatarUrl: undefined });
    try {
      const url = await generateLuxuryImage(state);
      setGenerated({ loading: false, avatarUrl: url });
    } catch (e: any) {
      setGenerated({ loading: false, error: e.message || "Failed to generate luxury content" });
    }
  };

  const handleLogoGenerate = async () => {
    if (!state.brandName) {
        setGenerated(prev => ({ ...prev, error: "Brand Name is required for logo generation" }));
        return;
    }
    setGenerated(prev => ({ ...prev, loading: true, error: undefined, logoUrl: undefined }));
    try {
        // We reuse the studio state interface structure for the service by mapping fields locally or updating service to take luxury state
        // For simplicity, we construct a temp object or update the service. 
        // Let's use the dedicated service which expects StudioState, but we can map LuxuryState to it or update service.
        // Actually, I'll update the service to be more flexible or just map it here.
        // Since generateLogo takes StudioState, let's map it:
        const logoState: any = {
            logoBrand: state.brandName,
            logoTagline: state.tagline,
            logoIndustry: state.industry,
            logoStyle: state.style
        };
        const url = await generateLogo(logoState);
        setGenerated(prev => ({ ...prev, loading: false, logoUrl: url }));
    } catch (e: any) {
        setGenerated(prev => ({ ...prev, loading: false, error: e.message }));
    }
  };

  const Select = ({ label, value, onChange, options, icon: Icon }: any) => (
    <div className="mb-4">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-xs text-zinc-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-900 transition-colors"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-black text-zinc-200 overflow-hidden">
      
      {/* LEFT COLUMN: SETTINGS */}
      <div className="w-80 bg-zinc-900/30 border-r border-zinc-800 overflow-y-auto custom-scrollbar p-4">
        <div className="mb-6 pb-4 border-b border-zinc-800">
           <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-1">
             <Diamond className="w-4 h-4" /> LUXURY SUITE
           </h2>
           <p className="text-[10px] text-zinc-500 uppercase tracking-widest">High-End Editorial & Branding</p>
        </div>

        <Select 
          label="Visual Theme" 
          icon={Crown}
          value={state.visualTheme} 
          onChange={(v: string) => updateState('visualTheme', v)} 
          options={['High Fashion Editorial', 'Old Money Aesthetic', 'Futuristic Luxury', 'Royal Elegance', 'Minimalist Chic']} 
        />
        <Select 
          label="Location / Setting" 
          icon={MapPin}
          value={state.location} 
          onChange={(v: string) => updateState('location', v)} 
          options={['Parisian Balcony', 'Private Jet Interior', 'Milan Fashion Week', 'Luxury Yacht', 'Penthouse NYC', 'Monaco Casino']} 
        />
        <Select 
          label="Brand Inspiration" 
          icon={Diamond}
          value={state.brandInspiration} 
          onChange={(v: string) => updateState('brandInspiration', v)} 
          options={['Chanel', 'Gucci', 'Versace', 'Louis Vuitton', 'Hermes', 'Prada', 'Balenciaga']} 
        />

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase">Character Details</h3>
          
          <div className="mb-4">
             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> AI Character Prompt
             </label>
             <textarea 
               value={state.customPrompt || ''}
               onChange={(e) => updateState('customPrompt', e.target.value)}
               className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-900 transition-colors resize-none placeholder:text-zinc-600"
               placeholder="Describe specific facial features, ethnicity, or specific body details for Nano Banana generation..."
             />
          </div>

          <Select label="Wardrobe" icon={Shirt} value={state.wardrobe} onChange={(v: string) => updateState('wardrobe', v)} options={['Haute Couture Gown', 'Tailored Bespoke Suit', 'Designer Streetwear', 'Avant-Garde Piece']} />
          <Select label="Footwear" value={state.footwear} onChange={(v: string) => updateState('footwear', v)} options={['Designer Stilettos', 'Luxury Loafers', 'High-End Sneakers', 'Leather Boots']} />
          <div className="grid grid-cols-2 gap-2">
            <Select label="Hairstyle" value={state.hairstyle} onChange={(v: string) => updateState('hairstyle', v)} options={['Sleek Updo', 'Hollywood Waves', 'Buzz Cut', 'Slick Back']} />
            <Select label="Texture" value={state.hairTexture} onChange={(v: string) => updateState('hairTexture', v)} options={['Silky Straight', 'Coily', 'Wavy', 'Wet Look']} />
          </div>
          <Select label="Pose" value={state.pose} onChange={(v: string) => updateState('pose', v)} options={['Power Stance', 'Relaxed Elegance', 'Walking Away', 'Over Shoulder']} />
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800">
           <h3 className="text-xs font-bold text-zinc-400 mb-4 uppercase">Scene Assets</h3>
           <Select label="Luxury Vehicle" icon={Car} value={state.luxuryVehicle} onChange={(v: string) => updateState('luxuryVehicle', v)} options={['Rolls Royce Phantom', 'Lamborghini Aventador', 'Vintage Porsche', 'Bentley Continental', 'None']} />
           <Select label="Props & Objects" icon={Wine} value={state.propsObjects} onChange={(v: string) => updateState('propsObjects', v)} options={['Champagne Glass', 'Designer Bag', 'Jewelry Box', 'Cigar', 'None']} />
        </div>
      </div>

      {/* CENTER: PREVIEW */}
      <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8">
         <div className="relative aspect-[9/16] h-full max-h-[800px] border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex items-center justify-center">
             {generated.loading ? (
                 <div className="flex flex-col items-center text-amber-500 animate-pulse">
                     <Diamond className="w-12 h-12 mb-4" />
                     <span className="text-xs font-bold tracking-widest uppercase">Designing Luxury Asset...</span>
                 </div>
             ) : generated.avatarUrl ? (
                 <img src={generated.avatarUrl} alt="Luxury Result" className="w-full h-full object-cover" />
             ) : (
                 <div className="text-zinc-700 flex flex-col items-center">
                     <Crown className="w-16 h-16 mb-2 opacity-20" />
                     <p className="text-xs tracking-widest uppercase">Luxury Mode</p>
                 </div>
             )}
             
             {/* Logo Overlay Result */}
             {generated.logoUrl && (
                 <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 shadow-lg z-20">
                     <img src={generated.logoUrl} alt="Generated Logo" className="w-full h-full object-contain drop-shadow-lg" />
                 </div>
             )}

             {generated.error && (
                 <div className="absolute inset-x-0 bottom-0 bg-red-900/80 text-white text-[10px] p-2 text-center">
                     {generated.error}
                 </div>
             )}
         </div>

         <button 
           onClick={handleGenerate}
           disabled={generated.loading}
           className="absolute bottom-8 bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-2 transform hover:scale-105 transition-all uppercase tracking-widest text-xs"
         >
           {generated.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Diamond className="w-4 h-4" />}
           Generate Editorial
         </button>
      </div>

      {/* BOTTOM LOGO STUDIO (Overlay or Separate Panel?) User asked for 'Below in the Middle' or 'Side'. Let's put it on the Right for balance. */}
      <div className="w-80 bg-zinc-900/30 border-l border-zinc-800 flex flex-col">
         <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
               <PenTool className="w-4 h-4" /> LOGO DESIGN STUDIO
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Brand Identity Generation</p>
         </div>
         
         <div className="p-6 space-y-5">
             <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Brand Name</label>
                <input 
                  type="text" 
                  value={state.brandName} 
                  onChange={(e) => updateState('brandName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-200 focus:border-amber-500 outline-none" 
                  placeholder="Brand Name"
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Tagline</label>
                <input 
                  type="text" 
                  value={state.tagline} 
                  onChange={(e) => updateState('tagline', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-200 focus:border-amber-500 outline-none" 
                  placeholder="Optional Tagline"
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Industry</label>
                <input 
                  type="text" 
                  value={state.industry} 
                  onChange={(e) => updateState('industry', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-200 focus:border-amber-500 outline-none" 
                  placeholder="e.g. Fashion, Tech"
                />
             </div>
             <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Style</label>
                <input 
                  type="text" 
                  value={state.style} 
                  onChange={(e) => updateState('style', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-200 focus:border-amber-500 outline-none" 
                  placeholder="e.g. Minimalist Serif"
                />
             </div>

             <button 
                onClick={handleLogoGenerate}
                disabled={generated.loading}
                className="w-full py-3 mt-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 text-xs"
             >
                Generate Logo Asset
             </button>
             
             {generated.logoUrl && (
                 <div className="mt-4 p-4 bg-white/5 rounded border border-white/10 flex flex-col items-center">
                     <img src={generated.logoUrl} alt="Logo Preview" className="w-24 h-24 object-contain mb-2" />
                     <button className="text-[10px] flex items-center gap-1 text-amber-400 hover:text-amber-300">
                         <Download className="w-3 h-3" /> Download Vector
                     </button>
                 </div>
             )}
         </div>
      </div>

    </div>
  );
};

export default LuxuryMode;
