
import React, { useEffect } from 'react';
import { Bot, Music, Volume2 } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface GuideCharacterProps {
  text: string;
  className?: string;
  autoSpeak?: boolean;
}

export const GuideCharacter: React.FC<GuideCharacterProps> = ({ 
  text, 
  className = '', 
  autoSpeak = true 
}) => {
  const { speak, isSpeaking, cancel } = useSpeech();

  useEffect(() => {
    if (autoSpeak && text) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        speak(text);
      }, 500);
      return () => {
        clearTimeout(timer);
        cancel();
      };
    }
  }, [text, autoSpeak, speak, cancel]);

  const handleReplay = () => {
    speak(text);
  };

  return (
    <div className={`flex items-start gap-4 ${className} transition-all duration-500 ease-out`}>
      {/* Character Avatar */}
      <button 
        onClick={handleReplay}
        className="relative shrink-0 group focus:outline-none"
        aria-label="Replay audio"
      >
        <div 
          className={`
            w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-300
            ${isSpeaking 
              ? 'bg-magic-500 border-magic-200 scale-110' 
              : 'bg-brand-500 border-brand-200 group-hover:scale-105 group-hover:bg-brand-400'}
          `}
        >
          <Bot className={`w-12 h-12 text-white ${isSpeaking ? 'animate-bounce' : ''}`} />
          
          {/* Speaking Waves */}
          {isSpeaking ? (
            <>
              <div className="absolute -inset-1 bg-magic-400 rounded-full opacity-30 animate-ping"></div>
              <div className="absolute -right-2 -top-2 bg-yellow-400 rounded-full p-1 animate-bounce delay-100">
                <Music className="w-4 h-4 text-yellow-900" />
              </div>
            </>
          ) : (
            <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Volume2 className="w-4 h-4 text-brand-600" />
            </div>
          )}
        </div>
      </button>

      {/* Speech Bubble */}
      <button 
        onClick={handleReplay}
        className="bg-white p-5 rounded-2xl rounded-tl-none shadow-lg border-2 border-brand-100 flex-1 relative animate-fade-in-up text-left group hover:border-brand-200 transition-colors"
      >
        <p className="text-xl font-display text-slate-700 font-medium group-hover:text-brand-700 transition-colors">
          {text}
        </p>
        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-opacity">
           <Volume2 className="w-5 h-5 text-brand-400" />
        </div>
      </button>
    </div>
  );
};
