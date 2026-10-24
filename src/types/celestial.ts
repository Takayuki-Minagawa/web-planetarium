export interface Constellation {
  id: string;
  nameJa: string;
  nameEn: string;
  abbr: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  description: string;
  descriptionEn: string;
  mythology: string;
  mythologyEn: string;
  mainStars: string[];
  lines: [string, string][];
  searchKeywords: string[];
}

export interface Star {
  id: string;
  nameJa: string;
  nameEn: string;
  constellation: string;
  ra: number;
  dec: number;
  mag: number;
  color: string;
  description: string;
  descriptionEn: string;
}

export interface Planet {
  id: string;
  nameJa: string;
  nameEn: string;
  symbol: string;
  color: string;
  description: string;
  descriptionEn: string;
}

export interface CelestialBody {
  id: string;
  nameJa: string;
  nameEn: string;
  type: 'constellation' | 'star' | 'planet' | 'sun' | 'moon';
  ra?: number;
  dec?: number;
  alt?: number;
  az?: number;
  mag?: number;
  isVisible?: boolean;
  description?: string;
  descriptionEn?: string;
}

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface SkySettings {
  showConstellationLines: boolean;
  showConstellationNames: boolean;
  showStarNames: boolean;
  showPlanetNames: boolean;
  showHorizon: boolean;
  showGrid: boolean;
  showMilkyWay: boolean;
  backgroundBrightness: number;
}
