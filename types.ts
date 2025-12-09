export type ThemeType = string;

export interface UserProfile {
  age: number;
  name: string;
  assets: string;
  dream: string;
  vibe: string; // User selected vibe (e.g., "Chaotic Good")
  theme: ThemeType; // AI Generated Title
  themeDescription?: string;
  themeImage?: string; // Base64 image URL
}

export interface BucketItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  partnerName: string; // e.g., 'Expedia', 'RedBalloon'
  partnerCategory: 'Travel' | 'Adventure' | 'Finance' | 'Wellness' | 'Legacy';
  completed: boolean;
  imagePrompt?: string; // Prompt for generating the image
  imageUrl?: string; // Base64 image URL
}

export interface GameState {
  xp: number;
  discountCredits: number;
  badges: string[];
}