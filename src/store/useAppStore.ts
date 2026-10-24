import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ObserverLocation, SkySettings, CelestialBody } from '../types/celestial';
import type { Lang } from '../i18n/translations';
import { DISCOVERY_IDS, discoveryCategoryOf, type DiscoveryCategory } from '../utils/bodies';

type Theme = 'dark' | 'light';

export interface DiscoveryToast {
  key: number;
  nameJa: string;
  nameEn: string;
  completed: DiscoveryCategory | 'all' | null;
}

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
  // 現在時刻に追従しているか（日時を操作すると false になる）
  live: boolean;
  tickNow: () => void;
  // パネル表示用の日時。早送り中は描画負荷を抑えるため間引いて更新する
  panelDateTime: Date;
  // 早送りで時間を進める（キャンバスは毎フレーム、パネルは間引き）
  advanceTime: (date: Date) => void;

  // 時間の早送り（タイムラプス）
  playing: boolean;
  setPlaying: (playing: boolean) => void;

  // 選択中の天体
  selectedBody: CelestialBody | null;
  setSelectedBody: (body: CelestialBody | null) => void;
  // 視点を天体へなめらかに移動して選択する
  focusBody: (body: CelestialBody) => void;

  // 星空図鑑（発見済みの天体ID）
  discovered: string[];
  toast: DiscoveryToast | null;
  dismissToast: () => void;

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
  flyTo: (az: number, alt: number) => void;
  cancelFly: () => void;

  // UI状態
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: 'constellations' | 'stars' | 'planets' | 'visible';
  setActiveTab: (tab: 'constellations' | 'stars' | 'planets' | 'visible') => void;
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  welcomeOpen: boolean;
  setWelcomeOpen: (open: boolean) => void;
}

const WELCOME_KEY = 'web-planetarium:welcome-seen';

function readWelcomeSeen(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

function writeWelcomeSeen() {
  try {
    localStorage.setItem(WELCOME_KEY, '1');
  } catch {
    // ストレージが使えない環境では毎回表示する
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function isDesktop(): boolean {
  return typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches;
}

// 保存内容が変わったときだけ書き込む（早送り中など頻繁な更新で localStorage を叩かないように）
let lastSaved = '';
const dedupedStorage = createJSONStorage(() => ({
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    if (value === lastSaved) return;
    lastSaved = value;
    localStorage.setItem(name, value);
  },
  removeItem: (name) => localStorage.removeItem(name),
}));

let flyFrame = 0;
let lastPanelSync = 0;
const PANEL_SYNC_MS = 500;

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: 'ja',
      setLang: (lang) => set({ lang }),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      location: { latitude: 35.6762, longitude: 139.6503, name: '東京' },
      setLocation: (location) => set({ location }),

      dateTime: new Date(),
      setDateTime: (dateTime) => set({ dateTime, panelDateTime: dateTime, live: false }),
      resetToNow: () => {
        const now = new Date();
        set({ dateTime: now, panelDateTime: now, playing: false, live: true });
      },
      live: true,
      tickNow: () => {
        const now = new Date();
        set({ dateTime: now, panelDateTime: now });
      },
      panelDateTime: new Date(),
      advanceTime: (dateTime) => {
        const now = performance.now();
        if (now - lastPanelSync >= PANEL_SYNC_MS) {
          lastPanelSync = now;
          set({ dateTime, panelDateTime: dateTime, live: false });
        } else {
          set({ dateTime, live: false });
        }
      },

      playing: false,
      setPlaying: (playing) => set((state) => (playing ? { playing } : { playing, panelDateTime: state.dateTime })),

      selectedBody: null,
      setSelectedBody: (selectedBody) => {
        if (!selectedBody || get().discovered.includes(selectedBody.id)) {
          set({ selectedBody });
          return;
        }
        const category = discoveryCategoryOf(selectedBody.id);
        if (!category) {
          set({ selectedBody });
          return;
        }
        // 初めて見る天体は図鑑に記録してお祝いを表示
        const discovered = [...get().discovered, selectedBody.id];
        const done = (cat: DiscoveryCategory) => DISCOVERY_IDS[cat].every((id) => discovered.includes(id));
        const allDone = (Object.keys(DISCOVERY_IDS) as DiscoveryCategory[]).every(done);
        set({
          selectedBody,
          discovered,
          toast: {
            key: Date.now(),
            nameJa: selectedBody.nameJa,
            nameEn: selectedBody.nameEn,
            completed: allDone ? 'all' : done(category) ? category : null,
          },
        });
      },
      focusBody: (body) => {
        if (body.az != null && body.alt != null) {
          // スマホでは下から詳細シートが出るので、天体が画面の上寄りに来るよう視点を下げる
          const offset = isDesktop() ? 0 : get().fov * 0.22;
          get().flyTo(body.az, Math.max(0, body.alt) - offset);
        }
        get().setSelectedBody(body);
      },

      discovered: [],
      toast: null,
      dismissToast: () => set({ toast: null }),

      skySettings: {
        showConstellationLines: true,
        showConstellationNames: true,
        showStarNames: true,
        showPlanetNames: true,
        showHorizon: true,
        showGrid: false,
        showMilkyWay: true,
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
      resetView: () => {
        set({ fov: 120 });
        get().flyTo(180, 45);
      },
      flyTo: (az, targetAlt) => {
        cancelAnimationFrame(flyFrame);
        const alt = Math.max(-10, Math.min(90, targetAlt));
        const { setCenterAz, setCenterAlt } = get();
        if (prefersReducedMotion()) {
          setCenterAz(az);
          setCenterAlt(alt);
          return;
        }
        const startAz = get().centerAz;
        const startAlt = get().centerAlt;
        // 方位は近い向きに回る
        const dAz = ((((az - startAz) % 360) + 540) % 360) - 180;
        const dAlt = alt - startAlt;
        const duration = Math.min(1400, 600 + Math.hypot(dAz, dAlt) * 4);
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const e = easeInOutCubic(p);
          setCenterAz(startAz + dAz * e);
          setCenterAlt(startAlt + dAlt * e);
          if (p < 1) flyFrame = requestAnimationFrame(step);
        };
        flyFrame = requestAnimationFrame(step);
      },
      cancelFly: () => cancelAnimationFrame(flyFrame),

      sidebarOpen: isDesktop(),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      activeTab: 'constellations',
      setActiveTab: (activeTab) => set({ activeTab }),
      helpOpen: false,
      setHelpOpen: (helpOpen) => set({ helpOpen }),
      welcomeOpen: !readWelcomeSeen(),
      setWelcomeOpen: (welcomeOpen) => {
        if (!welcomeOpen) writeWelcomeSeen();
        set({ welcomeOpen });
      },
    }),
    {
      name: 'web-planetarium',
      version: 1,
      storage: dedupedStorage,
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        skySettings: state.skySettings,
        discovered: state.discovered,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          skySettings: { ...current.skySettings, ...p.skySettings },
          discovered: Array.isArray(p.discovered) ? p.discovered : current.discovered,
        };
      },
    }
  )
);
