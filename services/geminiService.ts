import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, BucketItem } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate a single image
const generateImage = async (prompt: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" } 
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.warn("Failed to generate image for prompt:", prompt, error);
    return undefined;
  }
  return undefined;
};

export const generateBucketList = async (userProfile: UserProfile): Promise<{ themeTitle: string, themeDescription: string, themeImage?: string, items: BucketItem[] }> => {
  const modelId = "gemini-2.5-flash"; 

  const prompt = `
    You are a creative Gamemaster for "Safewill BucketQuest", a gamified legacy planning app.
    
    User Profile:
    - Name: ${userProfile.name}
    - Age: ${userProfile.age}
    - Life Dream: "${userProfile.dream}"
    - Selected Vibe/Personality: "${userProfile.vibe}"
    - Assets: "${userProfile.assets}"

    Task:
    1. Analyze the user's profile, dream, and **Selected Vibe**. Generate a unique, creative "Life Theme" or "Persona" title that specifically reflects their chosen vibe of "${userProfile.vibe}".
    2. Write a short, witty, inspiring description of this theme.
    3. **Write a vivid, artistic image generation prompt for this theme** (describe a scene that represents this persona abstractly or metaphorically, e.g., "A digital painting of a person standing on a mountain looking at a nebula").
    4. Generate 5 creative, personalized bucket list items aligned with this theme and vibe.
    5. **For each item, write a specific image generation prompt** (e.g., "A cinematic shot of someone skydiving over a beach").
    
    Return pure JSON.
  `;

  try {
    // 1. Generate Text Content
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themeTitle: { type: Type.STRING },
            themeDescription: { type: Type.STRING },
            themeImagePrompt: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard", "Legendary"] },
                  partnerName: { type: Type.STRING },
                  partnerCategory: { type: Type.STRING, enum: ["Travel", "Adventure", "Finance", "Wellness", "Legacy"] },
                  imagePrompt: { type: Type.STRING },
                },
                required: ["id", "title", "description", "difficulty", "partnerName", "partnerCategory", "imagePrompt"],
              },
            },
          },
          required: ["themeTitle", "themeDescription", "themeImagePrompt", "items"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    const data = JSON.parse(text);
    
    // 2. Generate Images in Parallel
    // We limit concurrency slightly or just fire them all since it's a demo and usually < 10 items.
    
    const themeImagePromise = generateImage(data.themeImagePrompt);
    
    const itemsWithImagesPromise = Promise.all(data.items.map(async (item: any) => {
      const imageUrl = await generateImage(item.imagePrompt);
      return {
        ...item,
        imageUrl,
        completed: false
      };
    }));

    const [themeImage, items] = await Promise.all([themeImagePromise, itemsWithImagesPromise]);

    return {
      themeTitle: data.themeTitle,
      themeDescription: data.themeDescription,
      themeImage,
      items
    };

  } catch (error) {
    console.error("Error generating bucket list:", error);
    return {
      themeTitle: "The Mystery Explorer",
      themeDescription: "The stars were cloudy, but your journey is just beginning. Make it count.",
      items: [
        {
          id: "fallback-1",
          title: "Visit the Moon",
          description: "Because why stay grounded? (API Error Fallback)",
          difficulty: "Legendary",
          partnerName: "Virgin Galactic",
          partnerCategory: "Adventure",
          completed: false
        },
        {
          id: "fallback-2",
          title: "Organize the Garage",
          description: "The final frontier of domestic life.",
          difficulty: "Hard",
          partnerName: "Howard's Storage",
          partnerCategory: "Wellness",
          completed: false
        }
      ]
    };
  }
};