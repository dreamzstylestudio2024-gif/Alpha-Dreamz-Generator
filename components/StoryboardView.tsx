import React, { useState } from 'react';
import { StoryboardPanel } from '../types';
import { Video, Image as ImageIcon, Mic, Clapperboard, ArrowLeft, Loader2 } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';

interface StoryboardViewProps {
  panels: StoryboardPanel[];
  onBack: () => void;
  topic: string;
  onVideoGenerated?: (url: string) => void;
}

const StoryboardView: React.FC<StoryboardViewProps> = ({ panels, onBack, topic, onVideoGenerated }) => {
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [videoError, setVideoError] = useState<string | undefined>(undefined);

  const handleGenerateVideo = async () => {
    setIsVideoGenerating(true);
    setVideoError(undefined);
    try {
        const firstPanel = panels[0];
        const prompt = `Cinematic video for vlog: ${topic}. Scene: ${firstPanel.videoPrompt || firstPanel.imagePrompt}. High quality, trending style.`;
        
        const url = await generateVeoVideo(prompt, firstPanel.imageUrl);
        setVideoUrl(url);
        if (onVideoGenerated) onVideoGenerated(url);
    } catch (e: any) {
        setVideoError(e.message || "Failed to generate video");
    } finally {
        setIsVideoGenerating(false);
    }
  };

  return (
    <div className="h-full bg-rose-50/30 flex flex-col text-stone-700">
      {/* Header */}
      <div className="h-16 border-b border-rose-100 flex items-center px-6 gap-4 bg-white/80 backdrop-blur sticky top-0 z-30">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-rose-50 rounded-full text-stone-400 hover:text-rose-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
           <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
             <Clapperboard className="w-5 h-5 text-rose-500" /> Storyboard Sequence
           </h2>
           <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">{topic}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        
        {/* VIDEO PREVIEW AREA (If generated) */}
        {(videoUrl || isVideoGenerating) && (
            <div className="max-w-5xl mx-auto mb-10 bg-white border border-rose-200 rounded-2xl overflow-hidden shadow-2xl shadow-rose-100/50">
                <div className="p-4 border-b border-rose-100 flex items-center gap-2 bg-rose-50/30">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-bold text-stone-700 uppercase tracking-wider">Veo Video Preview</span>
                </div>
                <div className="aspect-video w-full bg-stone-900 flex items-center justify-center">
                    {isVideoGenerating ? (
                        <div className="flex flex-col items-center gap-3 text-rose-300 animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <span className="text-xs font-mono uppercase tracking-widest">Generating Video with Veo...</span>
                            <span className="text-[10px] text-stone-500">This may take a minute</span>
                        </div>
                    ) : videoUrl ? (
                        <video controls autoPlay loop className="w-full h-full object-contain">
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : null}
                </div>
                {videoError && (
                    <div className="p-3 bg-red-50 text-red-500 text-xs text-center font-bold">
                        {videoError}
                    </div>
                )}
            </div>
        )}

        <div className="max-w-5xl mx-auto space-y-10">
          {panels.map((panel, index) => (
            <div key={index} className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-lg shadow-rose-100/30 flex flex-col md:flex-row h-auto min-h-[320px]">
              
              {/* Visuals Column */}
              <div className="w-full md:w-[45%] bg-stone-100 relative border-r border-rose-100">
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-stone-800 border border-rose-100 z-10 shadow-sm">
                  SCENE {panel.panelId || index + 1}
                </div>
                {panel.imageUrl ? (
                  <img src={panel.imageUrl} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Data Column */}
              <div className="flex-1 p-8 flex flex-col gap-6">
                
                {/* Script Section */}
                <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">
                    <Mic className="w-3 h-3" /> Script / Voiceover
                  </div>
                  <p className="text-stone-700 text-sm leading-relaxed italic font-medium">
                    "{panel.scriptVoiceover}"
                  </p>
                </div>

                {/* Action Section */}
                <div className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
                   <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
                    <Video className="w-3 h-3" /> Action Detail
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    {panel.actionDetail}
                  </p>
                </div>

                {/* Prompts Section */}
                <div className="grid grid-cols-1 gap-3 mt-auto">
                   <div className="group relative">
                      <label className="text-[10px] text-stone-400 font-bold uppercase mb-1 block">Image Prompt</label>
                      <div className="bg-stone-50 p-3 rounded-lg text-[10px] text-stone-500 font-mono truncate hover:whitespace-normal hover:absolute hover:z-20 hover:w-full hover:bg-white hover:shadow-xl hover:border-rose-200 border border-transparent transition-all cursor-help">
                        {panel.imagePrompt}
                      </div>
                   </div>
                </div>

              </div>
            </div>
          ))}
        </div>
        
        {/* Footer actions */}
        <div className="max-w-5xl mx-auto mt-10 flex justify-end gap-4 pb-12">
            <button className="px-8 py-3 rounded-xl bg-white border border-rose-200 text-stone-600 text-xs font-bold hover:bg-rose-50 transition-colors uppercase tracking-wider shadow-sm">
                Export PDF
            </button>
            <button 
                onClick={handleGenerateVideo}
                disabled={isVideoGenerating}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-rose-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider transform hover:scale-105"
            >
                {isVideoGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                Generate Video Preview
            </button>
        </div>
      </div>
    </div>
  );
};

export default StoryboardView;