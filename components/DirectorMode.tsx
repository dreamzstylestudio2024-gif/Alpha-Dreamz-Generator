import React, { useState } from 'react';
import { 
  Wand2, Clapperboard, Film, Sparkles, RefreshCw, 
  Lightbulb, Video, Music, Palette, Aperture, Sun,
  CheckCircle2, Settings2, Layout, Tag, ShieldCheck, MessageSquare, AlertCircle
} from 'lucide-react';
import { DirectorState, INITIAL_DIRECTOR_STATE, AspectRatio, CreationMode, GeneratedContent } from '../types';
import UploadZone from './UploadZone';
import StoryboardView from './StoryboardView';
import { rewriteVlogTopic, generateDirectorImage, generateFullStoryboard } from '../services/geminiService';

const DirectorMode: React.FC = () => {
  const [state, setState] = useState<DirectorState>(INITIAL_DIRECTOR_STATE);
  const [generated, setGenerated] = useState<GeneratedContent>({ loading: false });
  const [isRewriting, setIsRewriting] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const updateState = (key: keyof DirectorState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleRewrite = async () => {
    if (!state.vlogTopic) return;
    setIsRewriting(true);
    const newTopic = await rewriteVlogTopic(state.vlogTopic);
    updateState('vlogTopic', newTopic);
    setIsRewriting(false);
  };

  const handleGenerate = async () => {
    if (!agreedToTerms) return;
    setGenerated({ loading: true, error: undefined, avatarUrl: undefined, storyboard: undefined });
    setShowApproval(false);
    try {
      const avatarUrl = await generateDirectorImage(state);
      setGenerated({ loading: false, avatarUrl });
      setShowApproval(true);
    } catch (e: any) {
      setGenerated({ loading: false, error: e.message || "Failed to generate" });
    }
  };
  
  const handleEditSettings = () => {
    setShowApproval(false);
  };

  const handleGenerateStoryboard = async () => {
    setGenerated(prev => ({ ...prev, loading: true, error: undefined }));
    setShowApproval(false); 
    try {
      const storyboardData = await generateFullStoryboard(state);
      setGenerated(prev => ({ ...prev, loading: false, storyboard: storyboardData }));
    } catch (e: any) {
      setGenerated(prev => ({ ...prev, loading: false, error: e.message || "Failed to generate storyboard" }));
      setShowApproval(true); 
    }
  };

  if (generated.storyboard && generated.storyboard.length > 0) {
      return (
          <StoryboardView 
            panels={generated.storyboard} 
            onBack={() => setGenerated(prev => ({ ...prev, storyboard: undefined, loading: false }))} 
            topic={state.vlogTopic}
            onVideoGenerated={(url) => setGenerated(prev => ({ ...prev, videoUrl: url }))}
          />
      );
  }

  // Consistent Dropdown Component (Light Theme)
  const Select = ({ value, onChange, options, label, icon: Icon }: any) => (
    <div className="mb-3">
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-rose-400" />} {label}
      </label>
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2.5 text-xs text-stone-700 font-medium focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none shadow-sm hover:border-rose-300"
        >
          {options.map((opt: any) => {
             if (typeof opt === 'string') {
               return <option key={opt} value={opt}>{opt}</option>;
             } else {
               return (
                 <optgroup key={opt.label} label={opt.label} className="text-stone-900 font-bold bg-white">
                   {opt.options.map((subOpt: string) => (
                     <option key={subOpt} value={subOpt} className="text-stone-600 font-normal">{subOpt}</option>
                   ))}
                 </optgroup>
               );
             }
          })}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* === TOP SECTION: 3 COLUMNS === */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: REFERENCES */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-rose-100 overflow-y-auto p-5 custom-scrollbar">
          <h3 className="text-xs font-bold text-rose-500 mb-5 flex items-center gap-2 uppercase tracking-widest">
            <Film className="w-4 h-4" /> Assets & Source
          </h3>

          <div className="mb-6 space-y-2">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Creation Mode</label>
            <div className="flex bg-rose-50/50 p-1 rounded-xl border border-rose-100">
              {Object.values(CreationMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateState('creationMode', mode)}
                  className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wide rounded-lg transition-all ${
                    state.creationMode === mode 
                      ? 'bg-white text-rose-600 shadow-md shadow-rose-100' 
                      : 'text-stone-400 hover:text-rose-500'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <UploadZone 
            label="Character Reference" 
            file={state.characterRef} 
            onFileSelect={(f) => updateState('characterRef', f)} 
          />
          
          <div className="mb-5">
             <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
               <MessageSquare className="w-3 h-3 text-rose-400" /> AI Character Prompt
             </label>
             <textarea 
               value={state.characterPrompt}
               onChange={(e) => updateState('characterPrompt', e.target.value)}
               className="w-full h-24 bg-white border border-rose-100 rounded-xl p-3 text-xs text-stone-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 outline-none resize-none placeholder:text-stone-300 shadow-sm"
               placeholder="Describe facial features, ethnicity, or body details..."
             />
          </div>

          <UploadZone 
            label="Wardrobe Reference" 
            file={state.wardrobeRef} 
            onFileSelect={(f) => updateState('wardrobeRef', f)} 
          />
          <UploadZone 
            label="Environment / Setting" 
            file={state.environmentRef} 
            onFileSelect={(f) => updateState('environmentRef', f)} 
          />
        </div>

        {/* CENTER COLUMN: PREVIEW */}
        <div className="flex-1 bg-gradient-to-br from-stone-50 to-white flex flex-col items-center justify-center p-8 relative">
          
          <div 
            className={`relative bg-white border-4 border-white shadow-2xl shadow-rose-100/50 flex items-center justify-center overflow-hidden transition-all duration-500 rounded-sm
              ${state.aspectRatio === AspectRatio.Ratio_9_16 ? 'aspect-[9/16] h-[90%]' : ''}
              ${state.aspectRatio === AspectRatio.Ratio_16_9 ? 'aspect-[16/9] w-[90%]' : ''}
              ${state.aspectRatio === AspectRatio.Ratio_1_1 ? 'aspect-square h-[75%]' : ''}
            `}
          >
             {generated.loading ? (
               <div className="flex flex-col items-center gap-4 text-rose-400 animate-pulse">
                 <Clapperboard className="w-12 h-12 animate-bounce" />
                 <span className="text-sm font-bold uppercase tracking-widest text-rose-500">
                    {generated.avatarUrl && !generated.storyboard ? "Generating Storyboard..." : "Creating Magic..."}
                 </span>
               </div>
             ) : generated.avatarUrl ? (
               <img src={generated.avatarUrl} alt="Generated Scene" className="w-full h-full object-cover" />
             ) : (
               <div className="text-center text-stone-300 flex flex-col items-center">
                 <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-100">
                    <Video className="w-8 h-8 opacity-50 text-stone-400" />
                 </div>
                 <p className="text-sm font-bold tracking-widest uppercase text-stone-400">Director View</p>
                 <p className="text-xs text-stone-300 mt-1">Ready for Action</p>
               </div>
             )}
             
             {generated.error && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
                 <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                    <p className="text-rose-500 text-sm font-bold">{generated.error}</p>
                 </div>
               </div>
             )}
          </div>

          {/* Director's Approval Popup */}
          {showApproval && !generated.loading && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl bg-white/90 backdrop-blur-xl border border-rose-200 rounded-2xl p-5 shadow-[0_20px_50px_rgba(225,29,72,0.15)] animate-in slide-in-from-bottom-5 fade-in duration-500 z-50">
               <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 p-2.5 rounded-full hidden sm:block">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">Director's Approval</h4>
                    <p className="text-[11px] text-stone-500 leading-tight mb-4">
                      Does the avatar match your vision? Approve to proceed to storyboard generation.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleEditSettings}
                        className="flex-1 py-2.5 px-4 rounded-lg border border-stone-200 text-[10px] font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Settings2 className="w-3 h-3" /> EDIT
                      </button>
                      <button 
                        onClick={handleGenerateStoryboard}
                        className="flex-[2] py-2.5 px-4 rounded-lg bg-emerald-500 text-[10px] font-bold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                      >
                         <Layout className="w-3 h-3" /> APPROVE & STORYBOARD
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-l border-rose-100 overflow-y-auto p-5 custom-scrollbar">
          <h3 className="text-xs font-bold text-rose-500 mb-5 flex items-center gap-2 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Style & Config
          </h3>

          <div className="space-y-5">
             {/* Aspect Ratio */}
             <div>
               <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Aspect Ratio</label>
               <div className="flex gap-2">
                 {Object.values(AspectRatio).map((ratio) => (
                   <button
                    key={ratio}
                    onClick={() => updateState('aspectRatio', ratio)}
                    className={`flex-1 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${
                      state.aspectRatio === ratio 
                      ? 'border-rose-400 bg-rose-50 text-rose-600' 
                      : 'border-stone-200 bg-white text-stone-400 hover:border-rose-200'
                    }`}
                   >
                     {ratio}
                   </button>
                 ))}
               </div>
             </div>

             {/* Face Consistency Toggle */}
             <div className="flex items-center justify-between bg-rose-50/50 p-3 rounded-xl border border-rose-100">
               <span className="text-xs font-bold text-stone-600">Exact Face & Skin</span>
               <button 
                onClick={() => updateState('exactFace', !state.exactFace)}
                className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer shadow-inner ${state.exactFace ? 'bg-rose-400' : 'bg-stone-300'}`}
               >
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${state.exactFace ? 'left-5' : 'left-1'}`} />
               </button>
             </div>

             <Select 
               label="Aesthetic"
               icon={Palette}
               value={state.aesthetic}
               onChange={(v: string) => updateState('aesthetic', v)}
               options={['Cinematic Realism', 'Anime / 2D', '3D Pixar Style', 'Cyberpunk', 'Vintage Film', 'Minimalist', 'Gothic']}
             />

             <Select 
               label="Camera Movement"
               icon={Video}
               value={state.cameraMovement}
               onChange={(v: string) => updateState('cameraMovement', v)}
               options={[
                 'Handheld / Vlog Style (Natural Shake)',
                 'Cinematic Slow (Smooth)',
                 'Static Tripod (No Movement)',
                 'Slow Zoom In (Dramatic)',
                 'Slow Zoom Out (Reveal)',
                 'Orbit / 360 View',
                 'Dynamic / Fast Pace',
                 'Following Subject (Tracking Shot)',
                 'Custom Movement'
               ]}
             />

             <Select 
                label="Vlog Category" 
                icon={Tag}
                value={state.vlogCategory} 
                onChange={(v: string) => updateState('vlogCategory', v)} 
                options={[
                  {
                    label: "Routine & Lifestyle",
                    options: ['Day In The Life Routine', 'Get Ready with me (GRWM)', 'Morning Routine: Productive', 'Night Routine: Selfcare', 'Shower Routine (Everything Shower)', 'Sunday Reset Routine', 'Weekly & Planning']
                  },
                  {
                    label: "Fashion & Beauty",
                    options: ['Closet Cleanout', 'Huge Clothing Haul', 'Styling Video', 'Come shopping with me', 'Makeup tutorial: Full Beat', 'Sneaker Collection']
                  },
                  {
                    label: "Travel & Leisure",
                    options: ['Pack with me: Vacation', 'Airbnb Tour', 'Wellness Retreat', 'Roadtrip', 'Solo Date: Taking Myself Out', 'Weekend: Vlog Chill']
                  }
                ]} 
              />

             <div>
               <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5">
                 Vlog Topic
               </label>
               <textarea 
                 value={state.vlogTopic}
                 onChange={(e) => updateState('vlogTopic', e.target.value)}
                 className="w-full h-20 bg-white border border-rose-100 rounded-xl p-3 text-xs text-stone-600 focus:border-rose-400 focus:ring-2 focus:ring-rose-50 outline-none resize-none shadow-sm placeholder:text-stone-300"
               />
               <button 
                  onClick={handleRewrite}
                  disabled={isRewriting}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-500 py-2 rounded-lg border border-rose-200 transition-colors uppercase font-bold"
                 >
                   <Lightbulb className="w-3 h-3" /> {isRewriting ? 'Rewriting...' : 'Brainstorm AI Rewrite'}
               </button>
             </div>

             <div className="pt-5 border-t border-rose-100">
               <h4 className="text-xs font-bold text-stone-800 mb-3 uppercase tracking-wider">Appearance Details</h4>
               
               <Select 
                 label="Outfit" 
                 value={state.outfitStyle} 
                 onChange={(v: string) => updateState('outfitStyle', v)} 
                 options={[
                    { label: 'Casual', options: ['Casual Jeans & White Tee', 'Oversized Hoodies & Bike Shorts', 'Denim Jacket & Leggings'] },
                    { label: 'Chic & Business', options: ['Business Chic Blazer', 'Old Money Aesthetics', 'Parisian Chic'] },
                    { label: 'Evening', options: ['Little Black Dress', 'Red Evening Gown', 'Silk Slip Dress'] },
                    { label: 'Athleisure', options: ['Yoga Set', 'Pilates Princess Fit', 'Tennis Skirt & Polo'] }
                 ]} 
               />

               <div className="grid grid-cols-2 gap-3">
                 <Select label="Hair" value={state.hairStyle} onChange={(v: string) => updateState('hairStyle', v)} options={['Long Waves', 'Bob Cut', 'Pixie', 'Ponytail', 'Braids', 'Bald']} />
                 <Select label="Makeup" value={state.makeup} onChange={(v: string) => updateState('makeup', v)} options={['Clean Girl Makeup', 'Soft Glam Baddie', 'Full Glam Baddie', 'Dewy Glam']} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <Select label="Skin" value={state.skinType} onChange={(v: string) => updateState('skinType', v)} options={['Light', 'Light-medium', 'Medium', 'Tan', 'Brown', 'Deep Brown']} />
                 <Select label="Nails" value={state.nailStyle} onChange={(v: string) => updateState('nailStyle', v)} options={['Natural Short', 'Short Neutral', 'Long Almond', 'Red Baddie']} />
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* === BOTTOM SECTION: DIRECTOR'S SET & FOOTER === */}
      <div className="bg-white border-t border-rose-100 shadow-[0_-5px_30px_rgba(0,0,0,0.02)] z-10">
        
        {/* Director's Set Controls */}
        <div className="px-6 py-4 flex gap-8 items-center overflow-x-auto border-b border-rose-50">
          <div className="min-w-[100px]">
            <h2 className="text-sm font-bold text-stone-800 leading-tight">Director's<br/><span className="text-rose-500">Set</span></h2>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-4 min-w-[600px]">
            <Select 
              label="Video Flow" 
              icon={Film}
              value={state.musicVideoFlow} 
              onChange={(v: string) => updateState('musicVideoFlow', v)} 
              options={['Slow Motion', 'Fast Cut', 'One Take', 'Time Lapse', 'Reverse']} 
            />
            <Select 
              label="Vibe / Genre" 
              icon={Music}
              value={state.vibeGenre} 
              onChange={(v: string) => updateState('vibeGenre', v)} 
              options={['Lo-Fi Chill', 'High Energy Pop', 'Dark Moody', 'R & B', 'Hype / Trap Energy']} 
            />
            <Select 
              label="Performance" 
              icon={Aperture}
              value={state.performanceAction} 
              onChange={(v: string) => updateState('performanceAction', v)} 
              options={['Walking and Talking', 'Dancing', 'Sitting/Interview', 'Lip Syncing to Camera', 'Looking Out Window']} 
            />
            <Select 
              label="Lighting" 
              icon={Sun}
              value={state.setLighting} 
              onChange={(v: string) => updateState('setLighting', v)} 
              options={['Golden Hour', 'Studio Softbox', 'Neon Noir', 'Natural Daylight', 'Dark & Moody']} 
            />
          </div>
        </div>

        {/* Footer: Terms & Safety + Generate */}
        <div className="bg-rose-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-xs">
                    <p className="font-bold text-stone-700 uppercase tracking-wide">Terms & Safety</p>
                    <p className="text-stone-500 text-[10px]">No NSFW, Deepfakes, or Harmful Content allowed.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer group ml-4 bg-white px-3 py-1.5 rounded-lg border border-rose-200 hover:border-rose-400 transition-colors">
                    <input 
                        type="checkbox" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-stone-600 group-hover:text-rose-600 transition-colors">I Agree to Terms</span>
                </label>
            </div>

            <button 
               onClick={handleGenerate}
               disabled={!agreedToTerms || generated.loading || showApproval}
               className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-95 text-xs ${
                   agreedToTerms && !generated.loading && !showApproval
                   ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-200 hover:shadow-rose-300'
                   : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
               }`}
            >
               {generated.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
               {generated.avatarUrl ? "Regenerate Avatar" : "Generate Preview"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DirectorMode;