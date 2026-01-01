
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
    
    RECONSTRUCTION OPTIMIZATION (FOR TRELLIS AI):
    - The prompt MUST specify: "Full body shot of the creature, centered in frame, isolated on a solid stark white background, no floor shadow, high-key lighting from multiple angles."
    - Style: "Clean 3D digital render, smooth surfaces, vibrant colors, playful toy aesthetic."
    - Avoid: "Complex backgrounds, ground planes, or overlapping objects."
    
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
export const generateCreatureImage = async (imagePrompt: string): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-3-pro-image-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    console.error("Image Gen Error", error);
    const errorString = JSON.stringify(error);
    const msg = error.message || errorString;

    if (
      msg.includes("403") || 
      msg.includes("PERMISSION_DENIED") ||
      msg.includes("Requested entity was not found") ||
      (error.error && (error.error.code === 403 || error.error.status === "PERMISSION_DENIED"))
    ) {
      throw error;
    }
    return ""; 
  }
};
