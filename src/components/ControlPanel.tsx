import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, isDesktop } from '../store/useAppStore';
import { t, type TranslationKey } from '../i18n/translations';
import type { SkySettings } from '../types/celestial';
import { CITIES } from '../data/cities';
import {
  IconSun, IconMoon, IconHelp, IconPin, IconSliders, IconPlus, IconMinus, IconPlay, IconPause,
  IconBack, IconForward, IconCompass, IconClock, IconLocate, IconChevronDown, IconCheck,
} from './ui/Icons';

const DISPLAY_TOGGLES: { key: keyof Omit<SkySettings, 'backgroundBrightness'>; labelKey: TranslationKey }[] = [
  { key: 'showConstellationLines', labelKey: 'control.constellationLines' },
  { key: 'showConstellationNames', labelKey: 'control.constellationNames' },
  { key: 'showStarNames', labelKey: 'control.starNames' },
  { key: 'showPlanetNames', labelKey: 'control.planetNames' },
  { key: 'showMilkyWay', labelKey: 'control.milkyWay' },
  { key: 'showHorizon', labelKey: 'control.horizon' },
  { key: 'showGrid', labelKey: 'control.grid' },
];

type Popover = 'location' | 'settings' | null;

export default function ControlPanel() {
  const {
    dateTime, setDateTime, resetToNow, live, playing, setPlaying, location, setLocation,
    skySettings, updateSkySettings, resetView, fov, setFov, lang, setLang, theme, toggleTheme, setHelpOpen,
  } = useAppStore(useShallow((s) => ({
    dateTime: s.dateTime,
    setDateTime: s.setDateTime,
    resetToNow: s.resetToNow,
    live: s.live,
    playing: s.playing,
    setPlaying: s.setPlaying,
    location: s.location,
    setLocation: s.setLocation,
    skySettings: s.skySettings,
    updateSkySettings: s.updateSkySettings,
    resetView: s.resetView,
    fov: s.fov,
    setFov: s.setFov,
    lang: s.lang,
    setLang: s.setLang,
    theme: s.theme,
    toggleTheme: s.toggleTheme,
    setHelpOpen: s.setHelpOpen,
  })));

  const [popover, setPopover] = useState<Popover>(null);
  const [expanded, setExpanded] = useState(isDesktop);
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'error'>('idle');
  const rootRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // ポップオーバーは外側クリック・Esc で閉じる
  useEffect(() => {
    if (!popover) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPopover(null);
    };
    const onKey = (e: KeyboardEvent) => {
      // モーダルが開いているときの Esc はモーダルだけを閉じる
      if (e.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) setPopover(null);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [popover]);

  const togglePopover = (p: Popover) => setPopover((cur) => (cur === p ? null : p));

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoState('error');
      return;
    }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: lang === 'ja' ? '現在地' : 'Current',
        });
        setGeoState('idle');
        setPopover(null);
      },
      () => setGeoState('error'),
      { timeout: 10000 }
    );
  };

  const shiftHours = (h: number) => setDateTime(new Date(dateTime.getTime() + h * 3600_000));

  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, '0');
  const day = String(dateTime.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const hh = dateTime.getHours().toString().padStart(2, '0');
  const mm = dateTime.getMinutes().toString().padStart(2, '0');
  const dateLabel = dateTime.toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', weekday: 'short',
  });

  const inputCls = 'w-full min-w-0 rounded-lg bg-raised border border-line px-2 py-1.5 text-xs text-ink tabular focus:outline-none focus:border-accent transition-colors';
  const btn = 'inline-flex items-center justify-center gap-1 rounded-lg text-xs font-medium transition-all active:scale-95';
  const toolBtn = 'w-10 h-10 flex items-center justify-center text-muted hover:text-ink hover:bg-hover transition-colors';

  return (
    <div ref={rootRef} className="fixed top-3 right-3 z-[45] flex flex-col items-end gap-2 text-ink">
      {/* Date/Time */}
      <section className="panel rounded-2xl p-3 w-[16.5rem] animate-drop-in" aria-label={t('help.section.controls', lang)}>
        <div className="flex items-center justify-between gap-2">
          {live && !playing ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft text-ok px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-ok" />
              </span>
              {t('control.live', lang)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-nebula-soft text-nebula px-2 py-0.5 text-[10px] font-semibold">
              <IconClock size={11} />
              {t('control.timeTravel', lang)}
            </span>
          )}
          <span className="text-[11px] text-muted truncate">{dateLabel}</span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <p className="font-mono text-3xl font-semibold tracking-tight tabular leading-none py-1" aria-live="off">
            {hh}<span className={playing ? 'animate-pulse' : ''}>:</span>{mm}
          </p>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? t('control.pause', lang) : t('control.play', lang)}
              aria-pressed={playing}
              title={playing ? t('control.pause', lang) : t('control.play', lang)}
              className={`${btn} w-9 h-9 rounded-full ${playing ? 'bg-accent text-accent-ink shadow-[0_0_18px_-4px_var(--accent)]' : 'bg-accent-soft text-accent hover:brightness-125'}`}
            >
              {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? t('control.collapse', lang) : t('control.expand', lang)}
              aria-expanded={expanded}
              className={`${btn} w-7 h-9 text-faint hover:text-ink md:hidden`}
            >
              <IconChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-[1.2fr_1fr] gap-1.5 mt-2">
              <input
                type="date"
                aria-label={lang === 'ja' ? '日付' : 'Date'}
                value={dateStr}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const newDate = new Date(dateTime);
                  const parts = e.target.value.split('-');
                  newDate.setFullYear(+parts[0], +parts[1] - 1, +parts[2]);
                  setDateTime(newDate);
                }}
                className={inputCls}
              />
              <input
                type="time"
                aria-label={lang === 'ja' ? '時刻' : 'Time'}
                value={`${hh}:${mm}`}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const newDate = new Date(dateTime);
                  const [h, m] = e.target.value.split(':');
                  newDate.setHours(+h, +m);
                  setDateTime(newDate);
                }}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              <button onClick={() => shiftHours(-1)} aria-label={t('control.minus1h', lang)} className={`${btn} py-1.5 bg-raised text-muted hover:text-ink hover:bg-hover`}>
                <IconBack size={14} /> 1h
              </button>
              <button onClick={() => shiftHours(1)} aria-label={t('control.plus1h', lang)} className={`${btn} py-1.5 bg-raised text-muted hover:text-ink hover:bg-hover`}>
                1h <IconForward size={14} />
              </button>
              <button onClick={resetToNow} className={`${btn} py-1.5 bg-accent-soft text-accent hover:brightness-125`}>
                <IconClock size={14} /> {t('control.resetTime', lang)}
              </button>
              <button onClick={resetView} className={`${btn} py-1.5 bg-raised text-muted hover:text-ink hover:bg-hover`}>
                <IconCompass size={14} /> {t('control.resetView', lang)}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Toolbar */}
      <div className="panel rounded-2xl flex items-center overflow-hidden" role="toolbar" aria-label={t('control.settings', lang)}>
        <button
          onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
          className={`${toolBtn} text-xs font-bold`}
          aria-label={t('control.language', lang)}
          title={t('control.language', lang)}
        >
          {lang === 'ja' ? 'EN' : 'JA'}
        </button>
        <button
          onClick={toggleTheme}
          className={toolBtn}
          aria-label={isDark ? t('control.themeLight', lang) : t('control.themeDark', lang)}
          title={isDark ? t('control.themeLight', lang) : t('control.themeDark', lang)}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>
        <button onClick={() => setHelpOpen(true)} className={toolBtn} aria-label={t('help.title', lang)} title={t('help.title', lang)}>
          <IconHelp />
        </button>
        <button
          onClick={() => togglePopover('location')}
          className={`${toolBtn} ${popover === 'location' ? 'text-accent! bg-accent-soft' : ''}`}
          aria-label={t('control.location', lang)}
          aria-expanded={popover === 'location'}
          title={t('control.location', lang)}
        >
          <IconPin />
        </button>
        <button
          onClick={() => togglePopover('settings')}
          className={`${toolBtn} ${popover === 'settings' ? 'text-accent! bg-accent-soft' : ''}`}
          aria-label={t('control.settings', lang)}
          aria-expanded={popover === 'settings'}
          title={t('control.settings', lang)}
        >
          <IconSliders />
        </button>
        <span className="w-px h-6 bg-line" aria-hidden="true" />
        <button onClick={() => setFov(fov + 10)} className={toolBtn} aria-label={t('control.zoomOut', lang)} title={t('control.zoomOut', lang)}>
          <IconMinus size={18} />
        </button>
        <button onClick={() => setFov(fov - 10)} className={toolBtn} aria-label={t('control.zoomIn', lang)} title={t('control.zoomIn', lang)}>
          <IconPlus size={18} />
        </button>
      </div>

      {/* Location picker */}
      {popover === 'location' && (
        <PopoverCard title={t('control.location', lang)} icon={<IconPin size={16} />}>
          <button
            onClick={handleGetCurrentLocation}
            disabled={geoState === 'loading'}
            className="w-full text-left text-sm px-3 py-2 rounded-xl mb-1 flex items-center gap-2 text-accent bg-accent-soft hover:brightness-125 transition-all disabled:opacity-70"
          >
            <IconLocate size={16} className={geoState === 'loading' ? 'animate-spin' : ''} />
            {geoState === 'loading' ? t('control.locating', lang) : t('control.useCurrentLocation', lang)}
          </button>
          {geoState === 'error' && (
            <p className="text-xs text-off px-1 pb-1" role="alert">{t('control.locationError', lang)}</p>
          )}
          <div className="grid grid-cols-2 gap-1 mt-1">
            {CITIES.map(city => {
              const active = location.name === city.name || location.name === city.nameEn;
              return (
                <button
                  key={city.name}
                  onClick={() => {
                    setLocation({ latitude: city.lat, longitude: city.lng, name: lang === 'ja' ? city.name : city.nameEn });
                    setPopover(null);
                  }}
                  aria-pressed={active}
                  className={`text-left text-sm px-3 py-2 rounded-xl border transition-colors flex items-center justify-between ${
                    active ? 'bg-accent-soft border-accent/40 text-ink' : 'border-transparent hover:bg-hover text-muted hover:text-ink'
                  }`}
                >
                  {lang === 'ja' ? city.name : city.nameEn}
                  {active && <IconCheck size={14} className="text-accent" />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-line">
            <p className="text-xs mb-2 text-muted">{t('control.latLng', lang)}</p>
            <div className="flex gap-2" key={`${location.latitude},${location.longitude}`}>
              {(['latitude', 'longitude'] as const).map((field) => (
                <label key={field} className="flex-1">
                  <span className="sr-only">{t(field === 'latitude' ? 'control.latitude' : 'control.longitude', lang)}</span>
                  <input
                    type="number"
                    placeholder={t(field === 'latitude' ? 'control.latitude' : 'control.longitude', lang)}
                    step="0.01"
                    min={field === 'latitude' ? -90 : -180}
                    max={field === 'latitude' ? 90 : 180}
                    defaultValue={location[field]}
                    className={inputCls}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    onBlur={(e) => {
                      const raw = parseFloat(e.target.value);
                      if (isNaN(raw)) return;
                      // 極点ちょうどや範囲外の値では天体計算が破綻するため丸める
                      const v = field === 'latitude'
                        ? Math.max(-89.9, Math.min(89.9, raw))
                        : ((((raw + 180) % 360) + 360) % 360) - 180;
                      e.target.value = String(v);
                      if (v !== location[field]) setLocation({ ...location, [field]: v, name: undefined });
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
        </PopoverCard>
      )}

      {/* Settings panel */}
      {popover === 'settings' && (
        <PopoverCard title={t('control.settings', lang)} icon={<IconSliders size={16} />}>
          <div className="space-y-0.5">
            {DISPLAY_TOGGLES.map(item => {
              const on = skySettings[item.key];
              return (
                <button
                  key={item.key}
                  role="switch"
                  aria-checked={on}
                  onClick={() => updateSkySettings({ [item.key]: !on })}
                  className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-hover transition-colors"
                >
                  <span className={`text-sm ${on ? 'text-ink' : 'text-muted'}`}>{t(item.labelKey, lang)}</span>
                  <span className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-accent' : 'bg-line'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-4' : ''}`} />
                  </span>
                </button>
              );
            })}

            <div className="pt-3 mt-2 border-t border-line px-2">
              <label htmlFor="bg-brightness" className="flex items-center justify-between text-sm">
                <span>{t('control.brightness', lang)}</span>
                <span className="text-xs text-muted tabular">{Math.round(skySettings.backgroundBrightness * 100)}%</span>
              </label>
              <input
                id="bg-brightness"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={skySettings.backgroundBrightness}
                onChange={(e) => updateSkySettings({ backgroundBrightness: parseFloat(e.target.value) })}
                className="w-full mt-2 accent-[var(--accent)]"
              />
            </div>
          </div>
        </PopoverCard>
      )}
    </div>
  );
}

function PopoverCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="panel bg-surface-solid rounded-2xl p-3 w-[min(18rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-15rem)] overflow-y-auto scroll-thin animate-rise-in">
      <p className="text-sm font-semibold mb-2 flex items-center gap-2 px-1">
        <span className="text-accent">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}
