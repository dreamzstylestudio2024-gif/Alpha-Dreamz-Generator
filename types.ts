
export enum AppMode {
  Director = 'DIRECTOR',
  Studio = 'STUDIO'
}

export enum AspectRatio {
  Ratio_9_16 = '9:16',
  Ratio_16_9 = '16:9',
  Ratio_1_1 = '1:1',
  Ratio_4_5 = '4:5',
  Ratio_3_4 = '3:4'
}

export enum CreationMode {
  Vlog = 'Vlog',
  UGC_Influencer = 'UGC/Influencer'
}

export interface DirectorState {
  creationMode: CreationMode;
  characterRef: File | null;
  characterPrompt: string;
  wardrobeRef: File | null;
  environmentRef: File | null;
  aesthetic: string;
  exactFace: boolean;
  aspectRatio: AspectRatio;
  cameraMovement: string;
  vlogCategory: string;
  vlogTopic: string;
  outfitStyle: string;
  hairStyle: string;
  makeup: string;
  skinType: string;
  nailStyle: string;
  // Director's Set
  musicVideoFlow: string;
  vibeGenre: string;
  performanceAction: string;
  setLighting: string;
}

export const INITIAL_DIRECTOR_STATE: DirectorState = {
  creationMode: CreationMode.Vlog,
  characterRef: null,
  characterPrompt: '',
  wardrobeRef: null,
  environmentRef: null,
  aesthetic: 'Cinematic Realism',
  exactFace: true,
  aspectRatio: AspectRatio.Ratio_9_16,
  cameraMovement: 'Handheld / Vlog Style (Natural Shake)',
  vlogCategory: 'Day In The Life Routine',
  vlogTopic: 'A day in the life in Tokyo',
  outfitStyle: 'Casual Jeans & White Tee',
  hairStyle: 'Long Waves',
  makeup: 'Clean Girl Makeup',
  skinType: 'Light-medium',
  nailStyle: 'Short Neutral Polish',
  musicVideoFlow: 'Slow Motion',
  vibeGenre: 'Lo-Fi Chill',
  performanceAction: 'Walking and Talking',
  setLighting: 'Golden Hour'
};

export interface StudioState {
  tool: 'Image' | 'Logo';
  subjectType: 'Person' | 'Object';
  subjectImage: File | null;
  styleReference: File | null;
  prompt: string;
  batchCount: number;
  composition: string;
  aspectRatio: AspectRatio;
  faceMatch: boolean;
  toneMatch: boolean;
  bodyMatch: boolean;
  // Logo Design Studio Fields
  logoBrand: string;
  logoTagline: string;
  logoIndustry: string;
  logoStyle: string;
}

export const INITIAL_STUDIO_STATE: StudioState = {
  tool: 'Image',
  subjectType: 'Person',
  subjectImage: null,
  styleReference: null,
  prompt: '',
  batchCount: 1,
  composition: 'Waist Shot',
  aspectRatio: AspectRatio.Ratio_9_16,
  faceMatch: true,
  toneMatch: true,
  bodyMatch: true,
  logoBrand: '',
  logoTagline: '',
  logoIndustry: '',
  logoStyle: ''
};

export interface StoryboardPanel {
  panelId: number;
  imageUrl: string; // Base64 or URL
  scriptVoiceover: string;
  actionDetail: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface GeneratedContent {
  avatarUrl?: string;
  storyboard?: StoryboardPanel[];
  studioImages?: string[];
  logoUrl?: string;
  videoUrl?: string; // For Veo video generation
  loading: boolean;
  error?: string;
}

// Luxury Mode Types (Now Sub-State of Studio if needed, or kept separate for the view)
export interface LuxuryState {
  visualTheme: string;
  location: string;
  brandInspiration: string;
  // Character
  customPrompt: string;
  wardrobe: string;
  footwear: string;
  hairstyle: string;
  hairTexture: string;
  hairLength: string;
  lipDetail: string;
  nails: string;
  pose: string;
  // Scene Asset
  luxuryVehicle: string;
  propsObjects: string;
  // Logo Studio
  brandName: string;
  tagline: string;
  industry: string;
  style: string;
}

export const INITIAL_LUXURY_STATE: LuxuryState = {
  visualTheme: 'High Fashion Editorial',
  location: 'Parisian Balcony',
  brandInspiration: 'Chanel',
  customPrompt: '',
  wardrobe: 'Haute Couture Gown',
  footwear: 'Designer Stilettos',
  hairstyle: 'Sleek Updo',
  hairTexture: 'Silky Straight',
  hairLength: 'Long',
  lipDetail: 'Classic Red',
  nails: 'French Manicure',
  pose: 'Power Stance',
  luxuryVehicle: 'Rolls Royce Phantom',
  propsObjects: 'Champagne Glass',
  brandName: '',
  tagline: '',
  industry: 'Luxury Fashion',
  style: 'Minimalist Serif'
};
