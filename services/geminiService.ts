
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// to ensure it always uses the most up-to-date API key from the execution context.

export const generateVisionImage = async (prompt: string): Promise<string | null> => {
  try {
    // Initializing inside the function to use the most recent process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A highly aesthetic, inspirational vision board image representing: ${prompt}. Cinematic lighting, soft textures, modern photography style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through all parts to find the image part, as the response may contain both text and image parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating vision image:", error);
    return null;
  }
};

export const getPlanningSuggestions = async (goals: string) => {
  try {
    // Initializing inside the function to use the most recent process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these goals: "${goals}", suggest 3 actionable daily habits for 2026. Return as JSON with habit and description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              habit: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["habit", "description"]
          }
        }
      }
    });
    // Use .text property directly (not as a method) to extract output string
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error getting planning suggestions:", error);
    return [];
  }
};
