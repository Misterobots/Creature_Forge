import { CreatureData } from '../types';

const API_ENDPOINT = import.meta.env.VITE_HYBRID_ENDPOINT || 'https://creatures.shivelymedia.com/api';

export interface GenerationStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    outputUrl?: string;
    progress?: number;
}

export const generateExternal3D = async (data: CreatureData): Promise<string> => {
    try {
        // 1. Fetch Workflow Template
        const templateResponse = await fetch('/workflow_template.json');
        if (!templateResponse.ok) throw new Error("Could not load workflow template. Please Ensure 'public/workflow_template.json' exists.");

        // We get it as text to simpler replacement of placeholders
        let workflowStr = await templateResponse.text();

        // 2. Inject Data
        // We assume the user has put {{POSITIVE_PROMPT}} in their text node
        // And possibly {{INIT_IMAGE}} if they are doing Img2Img or Img23D
        workflowStr = workflowStr.replace('{{POSITIVE_PROMPT}}', data.imagePrompt || "Cute monster");

        // Safety check: parse it back to JSON to ensure validity
        const workflowObj = JSON.parse(workflowStr);

        // 3. Submit to ComfyUI (via VPS Proxy)
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

        // 4. Poll for Completion
        return await pollComfyHistory(promptId);

    } catch (error) {
        console.error("Hybrid Comfy Generation Error:", error);
        throw error;
    }
};

const pollComfyHistory = async (promptId: string): Promise<string> => {
    const POLLING_INTERVAL = 1000;
    const MAX_ATTEMPTS = 120; // 2 minutes

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        try {
            // We check the history endpoint. If the promptId appears there, it's done.
            const response = await fetch(`${API_ENDPOINT}/history/${promptId}`);

            if (response.ok) {
                const historyData = await response.json();

                // Check if our ID exists in history keys
                if (historyData[promptId]) {
                    const jobData = historyData[promptId];

                    // Find outputs
                    const outputs = jobData.outputs;
                    if (!outputs) throw new Error("Job completed but gave no outputs.");

                    // Look for the first output node (usually standard SaveImage or Save3D)
                    // We just grab the first file we find
                    for (const nodeId in outputs) {
                        const nodeOutput = outputs[nodeId];
                        if (nodeOutput.images && nodeOutput.images.length > 0) {
                            const img = nodeOutput.images[0];
                            // Construct the View URL
                            // ComfyUI format: /view?filename=...&type=output
                            return `${API_ENDPOINT}/view?filename=${img.filename}&type=${img.type}&subfolder=${img.subfolder}`;
                        }
                        if (nodeOutput.models && nodeOutput.models.length > 0) {
                            // Some custom 3D nodes might return 'models' or files differently
                            // Adjust based on specific 3D node output format
                            const model = nodeOutput.models[0];
                            return `${API_ENDPOINT}/view?filename=${model.filename}&type=${model.type}&subfolder=${model.subfolder}`;
                        }
                        // Fallback for generic files
                        if (nodeOutput.files && nodeOutput.files.length > 0) {
                            const f = nodeOutput.files[0];
                            return `${API_ENDPOINT}/view?filename=${f.filename}&type=${f.type}&subfolder=${f.subfolder}`;
                        }
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
