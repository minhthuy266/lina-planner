
import { GoogleGenAI, Type } from "@google/genai";

export const generateVisionImage = async (prompt: string): Promise<string | null> => {
  try {
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
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error getting planning suggestions:", error);
    return [];
  }
};

export const getDailyInsight = async (status: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tình trạng hiện tại của người dùng: ${status}. Hãy đưa ra 1 câu khuyên hoặc động viên ngắn gọn, chân thành, phong cách hiện đại (tiếng Việt), tối đa 15 từ.`,
      config: {
        systemInstruction: "Bạn là một trợ lý ảo thông minh, tâm lý cho một người mẹ đang sử dụng app planner. Hãy nói năng lễ phép nhưng gần gũi."
      }
    });
    return response.text || "Chúc má một ngày rực rỡ và đầy năng lượng!";
  } catch (error) {
    return "Mỗi bước nhỏ đều dẫn tới thành công lớn. Cố lên má nhé!";
  }
};
