import { ThemeType } from './types';
import { 
  Zap, 
  Leaf, 
  Rocket, 
  Home, 
  Cat, 
  ShieldAlert,
  Plane,
  Mountain,
  Heart,
  Briefcase,
  Scroll
} from 'lucide-react';

export const THEMES: { id: ThemeType; label: string; icon: any; description: string }[] = [
  { id: 'Chaotic Good', label: 'Chaotic Good', icon: Zap, description: 'Random acts of kindness and wild adventures.' },
  { id: 'Peaceful Monk', label: 'Peaceful Monk', icon: Leaf, description: 'Inner peace, meditation, and quiet reflection.' },
  { id: 'YOLO Adventurer', label: 'YOLO Adventurer', icon: Rocket, description: 'Adrenaline, travel, and zero regrets.' },
  { id: 'Soft Suburban', label: 'Soft Suburban', icon: Home, description: 'Comfort, gardening, and perfect BBQs.' },
  { id: 'Pet Parent', label: 'Pet Parent', icon: Cat, description: 'Everything for the fur babies.' },
  { id: 'Doomsday Prepper', label: 'Doomsday Prepper', icon: ShieldAlert, description: 'Ready for anything, anytime.' },
];

export const PARTNER_ICONS: Record<string, any> = {
  'Travel': Plane,
  'Adventure': Mountain,
  'Wellness': Heart,
  'Finance': Briefcase,
  'Legacy': Scroll
};

export const LIFE_EXPECTANCY = 81.3;

export const MOCK_ASSETS = [
  "House / Apartment",
  "Car / Vehicle",
  "Savings / Cash",
  "Superannuation",
  "Crypto",
  "Family Heirlooms"
];