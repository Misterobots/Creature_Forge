import React, { useState } from 'react';
import { CreatureData } from '../types';
import { generateExternal3D } from '../services/hybridService';
import { Button } from './Button';
import { Loader2, Box, Info } from 'lucide-react';

interface ExternalGeneratorProps {
    data: CreatureData;
    onImageGenerated?: (url: string) => void;
}

export const ExternalGenerator: React.FC<ExternalGeneratorProps> = ({ data, onImageGenerated }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [objUrl, setObjUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleGenerate = async () => {
        setStatus('loading');
        setErrorMsg(null);
        try {
            const result = await generateExternal3D(data);

            if (result.imageUrl && onImageGenerated) {
                onImageGenerated(result.imageUrl);
            }

            if (result.modelUrl) {
                setModelUrl(result.modelUrl);
                setObjUrl(result.objUrl || null);
                setStatus('success');
            } else {
                throw new Error("No model URL returned from worker.");
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.message || "Failed to connect to the Home Forge.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-slate-50 relative">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="relative z-10 max-w-md w-full text-center space-y-6">

                {/* State: Idle */}
                {status === 'idle' && (
                    <>
                        <div className="p-4 rounded-full bg-blue-100 mx-auto w-20 h-20 flex items-center justify-center text-blue-600 mb-4">
                            <Box className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Forge 3D Model</h3>
                        <p className="text-slate-600">
                            Send this design to your <b>Home Forge</b> (GPU Worker) to transform it into a high-quality 3D mesh.
                        </p>
                        <Button onClick={handleGenerate} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                            Start 3D Transformation
                        </Button>
                        <div className="flex items-start gap-2 text-xs text-left text-blue-600 bg-blue-50 p-3 rounded-lg">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>This prompts your private worker to run TRELLIS/TripoSR. It may take 1-3 minutes.</p>
                        </div>
                    </>
                )}

                {/* State: Loading */}
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 animate-pulse">Forging in Progress...</h3>
                        <p className="text-slate-500 text-sm">
                            The GPU is spinning up. The plastic is heating. <br />Calling API Proxy...
                        </p>
                    </div>
                )}

                {/* State: Error */}
                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                            {errorMsg}
                        </div>
                        <Button onClick={handleGenerate} variant="secondary">
                            Try Again
                        </Button>
                    </div>
                )}

                {/* State: Success */}
                {status === 'success' && modelUrl && (
                    <div className="space-y-4 w-full h-full flex flex-col items-center">
                        <div className="w-full aspect-square bg-slate-200 rounded-xl overflow-hidden relative border border-slate-300 shadow-inner">
                            {/* @ts-ignore */}
                            <model-viewer
                                src={modelUrl}
                                camera-controls
                                auto-rotate
                                shadow-intensity="1"
                                style={{ width: '100%', height: '100%' }}
                            >
                            </model-viewer>
                        </div>
                        <div className="w-full space-y-2">
                            <Button
                                onClick={() => window.open(modelUrl, '_blank')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                Download .GLB (Web Ready)
                            </Button>

                            {objUrl && (
                                <Button
                                    onClick={() => window.open(objUrl, '_blank')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Download .OBJ (Print Ready)
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
