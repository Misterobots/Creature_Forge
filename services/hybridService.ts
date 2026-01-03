import { CreatureData } from '../types';

const API_ENDPOINT = import.meta.env.VITE_HYBRID_ENDPOINT || 'https://creatures.shivelymedia.com/api';

export interface GenerationStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    outputUrl?: string;
    progress?: number;
}

// Output structure
export interface HybridOutput {
    modelUrl?: string;
    imageUrl?: string;
}

/**
 * Stage 1: Generate 2D Image Locally via ComfyUI (SDXL Turbo)
 */
export const generateLocal2D = async (imagePrompt: string): Promise<string> => {
    try {
        // 1. Fetch T2I Workflow Template
        const templateResponse = await fetch('/workflow_t2i.json');
        if (!templateResponse.ok) throw new Error("Could not load T2I workflow template.");

        let workflowStr = await templateResponse.text();

        // 2. Inject Prompt
        workflowStr = workflowStr.replace('{{PROMPT}}', imagePrompt);

        // 3. Submit to ComfyUI
        const workflowObj = JSON.parse(workflowStr);
        const promptResponse = await fetch(`${API_ENDPOINT}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflowObj })
        });

        if (!promptResponse.ok) throw new Error(`ComfyUI T2I rejected: ${promptResponse.statusText}`);

        const promptResult = await promptResponse.json();
        const promptId = promptResult.prompt_id;

        console.log("Local 2D Generation started with ID:", promptId);

        // 4. Poll and return only the Image URL
        const result = await pollComfyHistory(promptId);
        if (result.imageUrl) return result.imageUrl;
        throw new Error("Local T2I completed but returned no image.");

    } catch (error) {
        console.error("Local 2D Generation Error:", error);
        throw error;
    }
};

export const generateExternal3D = async (data: CreatureData): Promise<HybridOutput> => {
    try {
        // 1. Fetch Workflow Template
        const templateResponse = await fetch('/workflow_template.json');
        if (!templateResponse.ok) throw new Error("Could not load workflow template. Please Ensure 'public/workflow_template.json' exists.");

        let workflowStr = await templateResponse.text();

        // 2. Upload Image (If we have one and the workflow expects it)
        // Most 3D workflows (Trellis, TripoSR) need an input image.
        // 2. Upload Image (If we have one and the workflow expects it)
        // Check if we are doing Local Generation (skip upload)
        if (data.imageUrl && data.imageUrl !== "LOCAL_GENERATION" && workflowStr.includes('{{INPUT_IMAGE}}')) {
            console.log("Uploading 2D concept to ComfyUI...");
            const uploadedFilename = await uploadToComfy(data.imageUrl);
            workflowStr = workflowStr.replace('{{INPUT_IMAGE}}', uploadedFilename);
        }

        // 3. Inject Other Data
        // Inject the Prompt for Local Generation
        workflowStr = workflowStr.replace('{{POSITIVE_PROMPT}}', data.imagePrompt || "Cute monster");
        workflowStr = workflowStr.replace('{{PROMPT}}', data.imagePrompt || "Cute monster");

        // Safety check: parse it back to JSON to ensure validity
        const workflowObj = JSON.parse(workflowStr);

        // 4. Submit to ComfyUI (via VPS Proxy)
        const promptResponse = await fetch(`${API_ENDPOINT}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflowObj })
        });

        if (!promptResponse.ok) {
            throw new Error(`ComfyUI rejected request: ${promptResponse.statusText}`);
        }

        const promptResult = await promptResponse.json();
        const promptId = promptResult.prompt_id;

        if (!promptId) throw new Error("No prompt_id received from ComfyUI.");

        // 5. Poll for Completion
        return await pollComfyHistory(promptId);

    } catch (error) {
        console.error("Hybrid Comfy Generation Error:", error);
        throw error;
    }
};

// Helper to upload the 2D image to ComfyUI so it can be used by LoadImage nodes
async function uploadToComfy(imageUrl: string): Promise<string> {
    // 1. Fetch the blob from our own URL (or external URL)
    const imgRes = await fetch(imageUrl);
    const blob = await imgRes.blob();

    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append('image', blob, 'concept_art.png');
    formData.append('overwrite', 'true');

    // 3. Upload to ComfyUI
    const uploadRes = await fetch(`${API_ENDPOINT}/upload/image`, {
        method: 'POST',
        body: formData,
    });

    if (!uploadRes.ok) {
        throw new Error(`Failed to upload image to ComfyUI: ${uploadRes.statusText}`);
    }

    const result = await uploadRes.json();
    // ComfyUI returns { name: "filename.png", subfolder: "", type: "input" }
    return result.name;
}

// Update pollComfyHistory to return HybridOutput
const pollComfyHistory = async (promptId: string): Promise<HybridOutput> => {
    const POLLING_INTERVAL = 1000;
    const MAX_ATTEMPTS = 600; // 10 minutes

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            if (i % 10 === 0) console.log(`[Hybrid] Polling ComfyUI... Attempt ${i}/${MAX_ATTEMPTS}`);
            if (i === 0) console.log("[Hybrid] Parsing Logic Update Loaded - Checking for mesh keys...");

            // We check the history endpoint. If the promptId appears there, it's done.
            const response = await fetch(`${API_ENDPOINT}/history/${promptId}`);

            if (response.ok) {
                const historyData = await response.json();

                // Check if our ID exists in history keys
                if (historyData[promptId]) {
                    const jobData = historyData[promptId];
                    const outputs = jobData.outputs;
                    if (!outputs) throw new Error("Job completed but gave no outputs.");

                    const result: HybridOutput = {};

                    // Iterate through ALL outputs to find images and models
                    for (const nodeId in outputs) {
                        const nodeOutput = outputs[nodeId];
                        // console.log(`[Hybrid] FULL OUTPUT for Node ${nodeId}:`, JSON.stringify(nodeOutput, null, 2));

                        // Check for Images (2D Render)
                        if (nodeOutput.images && nodeOutput.images.length > 0) {
                            const img = nodeOutput.images[0];
                            result.imageUrl = `${API_ENDPOINT}/view?filename=${img.filename}&type=${img.type}&subfolder=${img.subfolder}`;
                        }

                        // Check for Models/Meshes (Standard & TripoSR)
                        // TripoSR nodes often use 'mesh' (singular) or 'meshes' (plural)
                        const meshOutput = nodeOutput.models || nodeOutput.meshes || nodeOutput.mesh;

                        // Helper to extract specific formats
                        const checkAndAssign = (item: any) => {
                            const url = `${API_ENDPOINT}/view?filename=${item.filename}&type=${item.type}&subfolder=${item.subfolder}`;
                            if (item.filename.toLowerCase().endsWith('.glb')) {
                                result.modelUrl = url;
                            } else if (item.filename.toLowerCase().endsWith('.obj')) {
                                result.objUrl = url;
                            }
                        };

                        if (meshOutput && meshOutput.length > 0) {
                            checkAndAssign(meshOutput[0]);
                        }

                        // Fallback: Check for generic files
                        if (nodeOutput.files && nodeOutput.files.length > 0) {
                            checkAndAssign(nodeOutput.files[0]);
                        }
                    }

                    // Only return if we found *something*
                    if (result.modelUrl || result.imageUrl || result.objUrl) {
                        return result;
                    }
                }
            }
        } catch (e) {
            // Ignore poll errors, just retry
        }

        // Wait
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    }

    throw new Error("Generation timed out polling ComfyUI.");
};
