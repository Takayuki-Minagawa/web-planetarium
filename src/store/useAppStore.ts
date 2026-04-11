import { create } from 'zustand';
import type { ObserverLocation, SkySettings, CelestialBody } from '../types/celestial';
import type { Lang } from '../i18n/translations';

type Theme = 'dark' | 'light';

interface AppState {
  // 言語
  lang: Lang;
  setLang: (lang: Lang) => void;

  // テーマ
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // 観測地点
  location: ObserverLocation;
  setLocation: (location: ObserverLocation) => void;

  // 日時
  dateTime: Date;
  setDateTime: (date: Date) => void;
  resetToNow: () => void;

  // 選択中の天体
  selectedBody: CelestialBody | null;
  setSelectedBody: (body: CelestialBody | null) => void;

  // 表示設定
  skySettings: SkySettings;
  updateSkySettings: (settings: Partial<SkySettings>) => void;

  // 視野
  centerAz: number;
  centerAlt: number;
  fov: number;
  setCenterAz: (az: number) => void;
  setCenterAlt: (alt: number) => void;
  setFov: (fov: number) => void;
  resetView: () => void;

  // UI状態
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: 'constellations' | 'stars' | 'planets' | 'visible';
  setActiveTab: (tab: 'constellations' | 'stars' | 'planets' | 'visible') => void;
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lang: 'ja',
  setLang: (lang) => set({ lang }),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  location: { latitude: 35.6762, longitude: 139.6503, name: '東京' },
  setLocation: (location) => set({ location }),

  dateTime: new Date(),
  setDateTime: (dateTime) => set({ dateTime }),
  resetToNow: () => set({ dateTime: new Date() }),

  selectedBody: null,
  setSelectedBody: (selectedBody) => set({ selectedBody }),

  skySettings: {
    showConstellationLines: true,
    showConstellationNames: true,
    showStarNames: true,
    showPlanetNames: true,
    showHorizon: true,
    showGrid: false,
    backgroundBrightness: 0,
  },
  updateSkySettings: (settings) =>
    set((state) => ({
      skySettings: { ...state.skySettings, ...settings },
    })),

  centerAz: 180,
  centerAlt: 45,
  fov: 120,
  setCenterAz: (centerAz) => set({ centerAz: ((centerAz % 360) + 360) % 360 }),
  setCenterAlt: (centerAlt) => set({ centerAlt: Math.max(-10, Math.min(90, centerAlt)) }),
  setFov: (fov) => set({ fov: Math.max(30, Math.min(180, fov)) }),
  resetView: () => set({ centerAz: 180, centerAlt: 45, fov: 120 }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  activeTab: 'constellations',
  setActiveTab: (activeTab) => set({ activeTab }),
  helpOpen: false,
  setHelpOpen: (helpOpen) => set({ helpOpen }),
}));
