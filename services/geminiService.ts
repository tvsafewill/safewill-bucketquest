import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, BucketItem } from "../types";

// Helper to get client safely. 
// We do not initialize globally to prevent app crash if API_KEY is missing.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  // If no key is found, we return null. The calling functions will handle this by falling back to mock data.
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Helper to generate a single image
const generateImage = async (prompt: string): Promise<string | undefined> => {
  const ai = getAiClient();
  if (!ai) return undefined;

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
  const ai = getAiClient();
  const modelId = "gemini-2.5-flash"; 

  // If no API key, immediately throw to trigger fallback
  if (!ai) {
    console.warn("API Key is missing. Using fallback data.");
    return getFallbackData();
  }

  const prompt = `
    You are a creative Gamemaster for "Safewill BucketQuest", a gamified legacy planning app.
    
    User Profile:
    - Name: ${userProfile.name}
    - Age: ${userProfile.age}
    - Life Dream: "${userProfile.dream}"
    - Selected Vibe/Personality: "${userProfile.vibe}"
    - Assets/Financial Status: "${userProfile.assets}"

    Task:
    1. **Persona Generation**: Analyze the user's profile, dream, and **Selected Vibe**. Generate a unique, creative "Life Theme" or "Persona" title.
    2. **Theme Description**: Write a short, witty, inspiring description of this theme that acknowledges their current stage in life (${userProfile.age} years old).
    3. **Theme Image Prompt**: Write a vivid, artistic image generation prompt for this theme (describe a scene that represents this persona abstractly or metaphorically).
    4. **Bucket List Generation**: Generate 5 creative, personalized bucket list items.
       
       **CRITICAL PERSONALIZATION RULES**:
       - **Integrate the Dream**: The items must functionally or thematically help achieve their specific "Life Dream": "${userProfile.dream}".
       - **Age Appropriate**: For age ${userProfile.age}, suggest items that are ${userProfile.age > 60 ? "meaningful, legacy-focused, or comfortably adventurous" : "ambitious, growth-oriented, or high-energy"}.
       - **Financial Reality**: User has "${userProfile.assets}". Ensure items fit this financial tier (e.g., if wealthy, suggest philanthropy or luxury travel; if modest, suggest creativity and local adventure).
       - **Vibe Alignment**: Filter all suggestions through the "${userProfile.vibe}" lens.

    5. **Item Image Prompts**: For each item, write a specific image generation prompt.
    
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
    return getFallbackData();
  }
};

const getFallbackData = () => ({
  themeTitle: "The Unbound Explorer",
  themeDescription: "Your API key might be missing, but your spirit isn't. Here is a demo quest to get you started!",
  items: [
    {
      id: "fallback-1",
      title: "Configure API Key",
      description: "Get your Gemini API Key from Google AI Studio and add it to your environment variables.",
      difficulty: "Easy" as const,
      partnerName: "Google Cloud",
      partnerCategory: "Legacy" as const,
      completed: false
    },
    {
      id: "fallback-2",
      title: "Visit the Moon",
      description: "Because why stay grounded? (Demo Mode)",
      difficulty: "Legendary" as const,
      partnerName: "Virgin Galactic",
      partnerCategory: "Adventure" as const,
      completed: false
    },
    {
      id: "fallback-3",
      title: "Organize the Garage",
      description: "The final frontier of domestic life.",
      difficulty: "Hard" as const,
      partnerName: "Howard's Storage",
      partnerCategory: "Wellness" as const,
      completed: false
    }
  ]
});