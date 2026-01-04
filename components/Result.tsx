
import React, { useState } from 'react';
import { CreatureData } from '../types';
import { Button } from './Button';
import { RefreshCw, Sparkles, ImageDown, Box, Zap, FileText } from 'lucide-react';
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

  const handleDownloadPrompt = () => {
    const content = `Name: ${data.name}\nDescription: ${data.description}\n\n[Generation Prompt]\n${data.imagePrompt}\n\n[Modifiers Applied (Auto)]\n+ "3D render, character design, white background, high quality, flat lighting, soft lighting, diffused light"\n- "complex background, trees, forest, nature, landscape, outdoors, mountains, grass, moss, chaotic, busy, shadows,..."`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${data.name.replace(/\s+/g, '_')}_prompt.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
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

      {/* NEW: Prompt Debugger */}
      <div className="max-w-4xl mx-auto mb-8 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Generation Info (For Fine-Tuning)
          </h3>
          <Button onClick={handleDownloadPrompt} size="sm" variant="secondary" className="h-8 text-xs">
            Download .txt
          </Button>
        </div>
        <div className="p-6 text-sm text-slate-600 font-mono bg-slate-50 overflow-x-auto whitespace-pre-wrap">
          <div className="mb-4">
            <strong className="text-slate-800">Dynamic Prompt (From Quiz):</strong>
            <p className="mt-1 p-2 bg-white border border-slate-200 rounded-md">{data.imagePrompt}</p>
          </div>
          <div>
            <strong className="text-slate-800">Hardcoded Modifiers (T2I Workflow):</strong>
            <p className="mt-1 p-2 bg-white border border-slate-200 rounded-md text-xs opacity-75">
              + "3D render, character design, white background, high quality, flat lighting, soft lighting"<br />
              - "complex background, trees, forest..."
            </p>
          </div>
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
