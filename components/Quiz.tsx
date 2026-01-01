
import React from 'react';
import { Question, VisualOption } from '../types';
import { ChevronRight } from 'lucide-react';
import { GuideCharacter } from './GuideCharacter';
import { useSpeech } from '../hooks/useSpeech';
import { 
  TreePine, Waves, Rocket, Flame, 
  Feather, Shield, Cloud, Mountain,
  Smile, Megaphone, Ghost, Sparkles,
  Wind, Dumbbell, EyeOff, Cookie,
  Apple, Fish, Zap, Moon,
  Leaf, Cpu, Star, Sun
} from 'lucide-react';

// Map icon string names to actual Lucide components
const ICON_MAP: Record<string, React.FC<any>> = {
  Tree: TreePine,
  Waves: Waves,
  Rocket: Rocket,
  Flame: Flame,
  Feather: Feather,
  Shield: Shield,
  Cloud: Cloud,
  Mountain: Mountain,
  Smile: Smile,
  Megaphone: Megaphone,
  Ghost: Ghost,
  Sparkles: Sparkles,
  Wind: Wind,
  Dumbbell: Dumbbell,
  EyeOff: EyeOff,
  Cookie: Cookie,
  Apple: Apple,
  Fish: Fish,
  Zap: Zap,
  Moon: Moon,
  Leaf: Leaf,
  Cpu: Cpu,
  Star: Star,
  Sun: Sun
};

interface QuizProps {
  currentQuestionIndex: number;
  question: Question;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  isToddlerMode: boolean;
  disabled?: boolean;
}

export const Quiz: React.FC<QuizProps> = ({ 
  currentQuestionIndex, 
  question, 
  totalQuestions, 
  onAnswer,
  isToddlerMode,
  disabled = false
}) => {
  const { speak } = useSpeech();
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  // For toddler mode, we want to construct a friendly spoken string
  const getSpokenText = () => {
    return isToddlerMode 
      ? question.text 
      : `Question ${currentQuestionIndex + 1}. ${question.text}`;
  };

  const isVisualOption = (option: any): option is VisualOption => {
    return typeof option === 'object' && 'icon' in option;
  };

  const handleOptionHover = (text: string) => {
    if (isToddlerMode && !disabled) {
      speak(text);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 font-display">
          <span>STEP {currentQuestionIndex + 1}</span>
          <span>{totalQuestions} STEPS</span>
        </div>
        <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${isToddlerMode ? 'bg-orange-400' : 'bg-gradient-to-r from-brand-400 to-magic-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Guide Character (Only in Toddler Mode) */}
      {isToddlerMode && (
        <div className="mb-6 flex justify-center">
          <GuideCharacter text={getSpokenText()} className="max-w-xl w-full" />
        </div>
      )}

      {/* Question Card */}
      <div className={`${isToddlerMode ? 'bg-transparent shadow-none' : 'bg-white rounded-3xl p-8 shadow-xl border border-slate-100'} animate-fade-in-up`}>
        {/* Heading */}
        {!isToddlerMode && (
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-800 mb-8 text-center leading-tight">
            {question.text}
          </h2>
        )}

        <div className={`grid gap-4 ${isToddlerMode ? 'grid-cols-2 gap-6' : 'grid-cols-1 md:grid-cols-2'}`}>
          {question.options.map((option, idx) => {
            if (isVisualOption(option)) {
              // Visual Render (Toddler Mode)
              const IconComp = ICON_MAP[option.icon] || Sparkles;
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => onAnswer(option.text)}
                  onMouseEnter={() => handleOptionHover(option.text)}
                  className={`
                    group flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl border-b-8 transition-all duration-200 transform hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-2
                    ${option.color} bg-white border-black/5 hover:border-black/10 shadow-xl
                    disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
                  `}
                >
                  <div className={`p-4 rounded-full mb-4 bg-white/60 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-14 h-14 md:w-20 md:h-20" strokeWidth={2.5} />
                  </div>
                  <span className="font-display font-black text-2xl md:text-3xl text-center leading-tight tracking-tight opacity-90">
                    {option.text}
                  </span>
                </button>
              );
            } else {
              // Standard Text Render
              return (
                <button
                  key={idx}
                  disabled={disabled}
                  onClick={() => onAnswer(option)}
                  className="group relative p-4 text-left rounded-xl border-2 border-slate-100 hover:border-brand-400 hover:bg-brand-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-slate-700 group-hover:text-brand-700">
                      {option}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
