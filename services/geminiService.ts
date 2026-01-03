
import { GoogleGenAI, Type } from "@google/genai";
import { CreatureConcept } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Generate the textual concept and image prompt from personality.
 */
export const generateCreatureConcept = async (answers: string[]): Promise<CreatureConcept> => {
  const ai = getClient();
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Analyze these personality traits: ${answers.join(', ')}.
    
    TASK:
    1. Invent a unique "Fantastic Creature" name and lore. 
    2. Create a specific image generation prompt for a 3D toy figure of this creature.
    
    RECONSTRUCTION OPTIMIZATION (FOR TRIPOSR AI):
    - The prompt MUST specify: "Full body shot of the creature, t-pose or neutral standing pose, centered in frame, completely isolated on a solid #FFFFFF white background."
    - Physics & Style: "Chunky soft vinyl toy aesthetic, thick limbs, solid connections between parts, low poly style, smooth matte clay texture, vibrant colors."
    - Avoid: "Thin spindly legs, floating parts, glowing auras, smoke, particles, complex backgrounds, shadows, blur, or overlapping objects."
    
    Return a JSON object only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class character designer specializing in 3D-printable toy concepts. You output strictly valid JSON.",
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["name", "description", "imagePrompt"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No concept data received");
    return JSON.parse(text) as CreatureConcept;
  } catch (e) {
    console.error("Concept Gen Error", e);
    throw e;
  }
};

/**
 * Step 2: Generate the 2D Image from the concept.
 */
/**
 * Step 2: Generate the 2D Image from the concept.
 * UPDATE: Returns a placeholder for Local Generation logic.
 */
export const generateCreatureImage = async (imagePrompt: string): Promise<string> => {
  // We are now generating locally on the worker.
  // We return a flag to tell the UI/Hybrid service to skip the upload.
  return "LOCAL_GENERATION";
};
