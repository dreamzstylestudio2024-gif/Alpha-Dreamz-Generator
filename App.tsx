import React, { useState } from 'react';
import { AppMode } from './types';
import DirectorMode from './components/DirectorMode';
import StudioMode from './components/StudioMode';
import { Clapperboard, LayoutGrid, Menu, User, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Director);

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-rose-300 selection:text-rose-900">
      {/* Navigation Header */}
      <header className="h-16 border-b border-rose-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter text-stone-800">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
               <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <span>ALPHA <span className="text-rose-500">DREAMZ</span></span>
          </div>
          
          <nav className="flex bg-rose-50 rounded-lg p-1 border border-rose-100 ml-8">
            <button
              onClick={() => setMode(AppMode.Director)}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
                mode === AppMode.Director 
                  ? 'bg-white text-rose-600 shadow-md shadow-rose-100' 
                  : 'text-stone-500 hover:text-rose-500 hover:bg-white/50'
              }`}
            >
              <Clapperboard className="w-3 h-3" /> Director Mode
            </button>
            <button
              onClick={() => setMode(AppMode.Studio)}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
                mode === AppMode.Studio 
                  ? 'bg-white text-rose-600 shadow-md shadow-rose-100' 
                  : 'text-stone-500 hover:text-rose-500 hover:bg-white/50'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> Studio Mode
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-stone-400 font-mono font-medium">MODEL: NANO BANANA (FLASH IMG)</p>
            <p className="text-[10px] text-emerald-500 font-mono flex items-center justify-end gap-1 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> SYSTEM READY
            </p>
          </div>
          <button className="w-9 h-9 rounded-full bg-white border border-rose-100 flex items-center justify-center hover:bg-rose-50 shadow-sm transition-colors text-rose-400">
            <User className="w-4 h-4" />
          </button>
          <button className="md:hidden text-stone-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {mode === AppMode.Director && <DirectorMode />}
        {mode === AppMode.Studio && <StudioMode />}
      </main>
    </div>
  );
};

export default App;