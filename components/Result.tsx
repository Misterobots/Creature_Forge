
import React, { useState } from 'react';
import { CreatureData } from '../types';
import { Button } from './Button';
import { RefreshCw, Sparkles, ImageDown, Box, Zap } from 'lucide-react';
import { GuideCharacter } from './GuideCharacter';
import { ExternalGenerator } from './ExternalGenerator';

interface ResultProps {
  data: CreatureData;
  onReset: () => void;
  isToddlerMode: boolean;
}

export const Result: React.FC<ResultProps> = ({ data, onReset, isToddlerMode }) => {
  // If we are doing local generation, there is no 2D image yet, so start on the 3D tab.
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>(
    data.imageUrl === "LOCAL_GENERATION" ? '3d' : '2d'
  );

  // Local state for the image URL, allowing it to be updated by Local Generation
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(data.imageUrl);

  const handleImageGenerated = (url: string) => {
    setCurrentImageUrl(url);
    // Optionally alert user or just strictly update the state
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `${data.name.replace(/\s+/g, '_')}_concept.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const spokenResult = `Wow! We made a ${data.name}! ${data.description.substring(0, 100)}`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {isToddlerMode && (
        <div className="max-w-3xl mx-auto">
          <GuideCharacter text={spokenResult} />
        </div>
      )}

      <div className="text-center space-y-4">
        <span className="inline-block px-4 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold uppercase tracking-wider">
          Creature Forged
        </span>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-800">
          {data.name}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {data.description}
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex">
          <button
            onClick={() => setActiveTab('2d')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === '2d'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <Sparkles className="w-4 h-4" /> 2D Concept
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === '3d'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
              }`}
          >
            <Zap className="w-4 h-4" /> Home Forge 3D
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-3xl p-1 shadow-xl border-4 border-slate-100 max-w-4xl w-full h-[600px] flex flex-col relative overflow-hidden">
          {activeTab === '2d' ? (
            { activeTab === '2d' ? (
              <div className="w-full h-full relative group">
                {currentImageUrl && currentImageUrl !== "LOCAL_GENERATION" ? (
                  <>
                    <img
                      src={currentImageUrl}
                      alt={data.name}
                      className="w-full h-full object-contain bg-slate-50"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      {/* Overlay content if needed */}
                    </div>
                    <div className="absolute bottom-6 right-6 pointer-events-auto">
                      <Button variant="secondary" size="lg" onClick={handleDownloadImage} className="shadow-xl">
                        <ImageDown className="w-5 h-5 mr-2" />
                        Save Image
                      </Button>
                    </div>
                  </>
                ) : currentImageUrl === "LOCAL_GENERATION" ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                    <Sparkles className="w-12 h-12 text-brand-400" />
                    <p className="text-lg font-medium">Concept Ready for Forging</p>
                    <p className="text-sm opacity-70">Switch to the "Home Forge 3D" tab to generate the image & model locally.</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    Image Unavailable
                  </div>
                )}
              </div>
            ) : (
              <ExternalGenerator data={data} onImageGenerated={handleImageGenerated} />
            )}
        </div>
      </div>



      <div className="flex justify-center pt-8 border-t border-slate-200">
        <Button onClick={onReset} variant="secondary" size="lg" className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Forge Another Creature
        </Button>
      </div>
    </div>
  );
};
