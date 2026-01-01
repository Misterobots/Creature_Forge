import React, { useEffect, useState } from 'react';
import { Loader2, Hammer, Wand2 } from 'lucide-react';

interface GeneratingProps {
  stage?: string;
}

export const Generating: React.FC<GeneratingProps> = ({ stage }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-200 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-white p-6 rounded-full shadow-lg">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
        </div>
        <div className="absolute -right-4 -top-4 bg-magic-100 p-2 rounded-full animate-bounce delay-100">
          <Wand2 className="w-6 h-6 text-magic-600" />
        </div>
        <div className="absolute -left-4 -bottom-4 bg-orange-100 p-2 rounded-full animate-bounce delay-300">
          <Hammer className="w-6 h-6 text-orange-600" />
        </div>
      </div>

      <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">
        Forging your Creature
      </h2>
      <p className="text-slate-500 h-6 transition-all duration-300 font-medium">
        {stage || "Consulting the ancient scrolls"}{dots}
      </p>
    </div>
  );
};
