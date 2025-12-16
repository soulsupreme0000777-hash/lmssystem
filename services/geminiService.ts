import { GoogleGenAI, Type } from "@google/genai";
import { Module, Lesson } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

export const generateCourseStructure = async (topic: string): Promise<Module[]> => {
  const prompt = `Create a detailed course curriculum for a course about "${topic}". 
  Generate 3-4 modules, and for each module generate 2-3 lessons. 
  Each lesson should have a brief educational content summary (2-3 sentences).
  Estimate duration for each lesson.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Module title" },
              lessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Lesson title" },
                    content: { type: Type.STRING, description: "Brief lesson content/summary" },
                    durationMinutes: { type: Type.INTEGER, description: "Estimated minutes" },
                    type: { type: Type.STRING, enum: ["text", "video"], description: "Type of lesson" }
                  },
                  required: ["title", "content", "durationMinutes", "type"]
                }
              }
            },
            required: ["title", "lessons"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map response to our internal IDs
    return data.map((mod: any, index: number) => ({
      id: `generated-mod-${Date.now()}-${index}`,
      title: mod.title,
      lessons: mod.lessons.map((les: any, lIndex: number) => ({
        id: `generated-les-${Date.now()}-${index}-${lIndex}`,
        title: les.title,
        content: les.content,
        type: les.type || 'text',
        durationMinutes: les.durationMinutes || 10,
        videoUrl: les.type === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : undefined // Placeholder
      }))
    }));

  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
};