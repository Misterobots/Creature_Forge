
import React, { useState } from 'react';
import { CreatureData } from '../types';
import { Button } from './Button';
import { RefreshCw, Sparkles, ImageDown, Box, Zap, FileText } from 'lucide-react';
// ... (imports)

// ... (inside component)
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

// ... (render)

<div className="flex justify-center mb-8">
  <div className="bg-white rounded-3xl p-1 shadow-xl border-4 border-slate-100 max-w-4xl w-full h-[600px] flex flex-col relative overflow-hidden">
    {/* ... existing image/3d view ... */}
    {activeTab === '2d' ? (
      // ...
    ): (
        <ExternalGenerator data = { data } onImageGenerated = { handleImageGenerated } />
             )}
  </div>
</div>

{/* NEW: Prompt Debugger */ }
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
                    + "3D render, character design, white background, high quality, flat lighting, soft lighting"<br/>
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
    </div >
  );
};
