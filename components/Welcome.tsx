
import React from 'react';
import { Button } from './Button';
import { Box, Sparkles, Key, ExternalLink, Baby, ChevronRight } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
  onToddlerStart: () => void;
  onConnect: () => void;
  hasApiKey: boolean;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart, onToddlerStart, onConnect, hasApiKey }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 px-4">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-magic-500 to-brand-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-xl">
          <Box className="w-20 h-20 text-brand-600" strokeWidth={1.5} />
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-lg">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-800">
          Fantastic <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-500 to-brand-600">Creature Forger</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Answer 10 fun questions to forge a unique mythical companion. We'll generate a 3D-printable model script just for you!
        </p>
      </div>

      {!hasApiKey ? (
        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-md">
           <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
             <Key className="w-6 h-6" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">API Key Required</h3>
             <p className="text-sm text-slate-500 mb-4">
               To generate high-quality 3D concepts with Gemini 3 Pro, please select a paid Google Cloud Project API key.
             </p>
             <Button onClick={onConnect} className="w-full flex items-center justify-center gap-2">
               Connect API Key
             </Button>
           </div>
           <a 
             href="https://ai.google.dev/gemini-api/docs/billing" 
             target="_blank" 
             rel="noreferrer"
             className="text-xs text-brand-500 flex items-center gap-1 hover:underline"
           >
             Billing Information <ExternalLink className="w-3 h-3" />
           </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={onStart} className="text-lg py-4 w-full shadow-brand-500/20">
            Start Forging
          </Button>

          <button 
            onClick={onToddlerStart}
            className="group flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border-2 border-orange-200 transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-200 p-2 rounded-lg text-orange-600">
                <Baby className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-orange-800 font-display">Toddler Mode</span>
                <span className="text-xs text-orange-600 font-semibold">With Audio Guide!</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-300 group-hover:text-orange-500" />
          </button>
        </div>
      )}
    </div>
  );
};
