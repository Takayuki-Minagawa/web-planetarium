import { useState, useMemo, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, isDesktop } from '../store/useAppStore';
import { constellations } from '../data/constellations';
import { stars } from '../data/stars';
import { planets, specialBodies } from '../data/planets';
import {
  getMoonPhase,
  getVisibleBodies,
  getSunTimes,
  getMoonTimes,
  getSkyState,
} from '../utils/astronomy';
import {
  constellationBody,
  starBody,
  planetBody,
  specialBody,
  bodyById,
  DISCOVERY_IDS,
  DISCOVERY_TOTAL,
  textSymbol,
  constellationById,
  type DiscoveryCategory,
} from '../utils/bodies';
import { t, localizedName, getMoonPhaseName, directionName, locationLabel, type TranslationKey } from '../i18n/translations';
import type { CelestialBody, Constellation } from '../types/celestial';
import { ConstellationThumb, MoonPhaseIcon } from './ui/Visuals';
import {
  IconClose, IconMenu, IconSearch, IconConstellation, IconStar, IconPlanet, IconEye,
  IconCheck, IconPin, Sparkle, IconSun, IconMoon, IconBack,
} from './ui/Icons';

type Season = Constellation['season'];

const SEASON_KEYS: Record<Season, TranslationKey> = {
  spring: 'season.spring',
  summer: 'season.summer',
  autumn: 'season.autumn',
  winter: 'season.winter',
  all: 'season.all',
};

const SEASON_COLOR: Record<Season, string> = {
  spring: 'var(--spring)',
  summer: 'var(--summer)',
  autumn: 'var(--autumn)',
  winter: 'var(--winter)',
  all: 'var(--muted)',
};

type Tab = 'constellations' | 'stars' | 'planets' | 'visible';

export default function Sidebar() {
  const {
    sidebarOpen, setSidebarOpen, activeTab, setActiveTab, location, dateTime,
    focusBody, selectedBody, lang, discovered,
  } = useAppStore(useShallow((s) => ({
    sidebarOpen: s.sidebarOpen,
    setSidebarOpen: s.setSidebarOpen,
    activeTab: s.activeTab,
    setActiveTab: s.setActiveTab,
    location: s.location,
    dateTime: s.dateTime,
    focusBody: s.focusBody,
    selectedBody: s.selectedBody,
    lang: s.lang,
    discovered: s.discovered,
  })));

  const [searchQuery, setSearchQuery] = useState('');
  const [season, setSeason] = useState<Season | null>(null);
  const discoveredSet = useMemo(() => new Set(discovered), [discovered]);

  const tabs: { id: Tab; labelKey: TranslationKey; icon: ReactNode }[] = [
    { id: 'constellations', labelKey: 'tab.constellations', icon: <IconConstellation size={18} /> },
    { id: 'stars', labelKey: 'tab.stars', icon: <IconStar size={18} /> },
    { id: 'planets', labelKey: 'tab.planets', icon: <IconPlanet size={18} /> },
    { id: 'visible', labelKey: 'tab.visible', icon: <IconEye size={18} /> },
  ];

  // 選択して視点を移動。スマホではメニューを閉じて星空を見せる
  const select = (body: CelestialBody | null) => {
    if (!body) return;
    focusBody(body);
    if (!isDesktop()) setSidebarOpen(false);
  };

  const q = searchQuery.trim().toLowerCase();

  const filteredConstellations = useMemo(() => {
    let list = constellations;
    if (season) list = list.filter((c) => c.season === season);
    if (!q) return list;
    return list.filter(c =>
      c.nameJa.includes(q) || c.nameEn.toLowerCase().includes(q) || c.searchKeywords.some(k => k.toLowerCase().includes(q))
    );
  }, [q, season]);

  const filteredStars = useMemo(() => {
    if (!q) return stars.filter(s => s.mag < 2.5);
    return stars.filter(s =>
      s.nameJa.includes(q) || s.nameEn.toLowerCase().includes(q)
    );
  }, [q]);

  const matches = (nameJa: string, nameEn: string) => !q || nameJa.includes(q) || nameEn.toLowerCase().includes(q);
  const filteredSpecial = specialBodies.filter((b) => matches(b.nameJa, b.nameEn));
  const filteredPlanets = planets.filter((p) => matches(p.nameJa, p.nameEn));

  // 各天体の現在位置（リストの「見える」表示用）
  const constellationAlt = useMemo(
    () => new Map(constellations.map((c) => [c.id, constellationBody(c, dateTime, location)?.alt ?? -90])),
    [dateTime, location]
  );
  const solarBodies = useMemo(() => {
    const map = new Map<string, CelestialBody>();
    for (const b of specialBodies) map.set(b.id, specialBody(b, dateTime, location));
    for (const p of planets) {
      const body = planetBody(p, dateTime, location);
      if (body) map.set(p.id, body);
    }
    return map;
  }, [dateTime, location]);

  const visibleBodies = useMemo(() => getVisibleBodies(dateTime, location), [dateTime, location]);
  const sunTimes = useMemo(() => getSunTimes(dateTime, location), [dateTime, location]);
  const moonTimes = useMemo(() => getMoonTimes(dateTime, location), [dateTime, location]);
  const moonPhase = useMemo(() => getMoonPhase(dateTime), [dateTime]);
  const skyState = useMemo(() => getSkyState(dateTime, location), [dateTime, location]);

  const formatTime = (d: Date | undefined) =>
    d ? d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  // 「次の発見へ」: いま見えている未発見の天体を優先して案内
  const discoverNext = () => {
    const all = [...DISCOVERY_IDS.constellation, ...DISCOVERY_IDS.star, ...DISCOVERY_IDS.solar];
    const undiscovered = all.filter((id) => !discoveredSet.has(id));
    const pool = undiscovered.length > 0 ? undiscovered : all;
    const bodies = pool.map((id) => bodyById(id, dateTime, location)).filter((b): b is CelestialBody => !!b);
    // 地平線すれすれは見つけにくいので、ある程度の高さがあるものを優先
    const up = bodies.filter((b) => (b.alt ?? -90) > 10 && b.id !== selectedBody?.id);
    const candidates = up.length > 0 ? up : bodies;
    select(candidates[Math.floor(Math.random() * candidates.length)]);
  };

  const visibleCount = visibleBodies.filter(b => b.isVisible).length;
  const counts: Record<Tab, number> = {
    constellations: filteredConstellations.length,
    stars: filteredStars.length,
    planets: filteredSpecial.length + filteredPlanets.length,
    visible: visibleCount,
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? t('sidebar.closeMenu', lang) : t('sidebar.openMenu', lang)}
        aria-expanded={sidebarOpen}
        className={`panel fixed top-3 left-3 z-[55] md:z-50 w-11 h-11 ${sidebarOpen ? 'md:hidden' : ''} rounded-xl flex items-center justify-center text-ink hover:bg-hover active:scale-95 transition-transform`}
      >
        {sidebarOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[48] bg-black/55 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label={t('app.title', lang)}
        className={`
          fixed top-0 left-0 h-full z-50 md:z-40 w-[min(88vw,22rem)] md:w-80
          panel border-y-0 border-l-0 rounded-none bg-surface-solid md:bg-surface
          transition-[transform,visibility] duration-300 ease-out flex flex-col text-ink
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full invisible'}
        `}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 pl-16 md:pl-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-accent-soft text-accent shrink-0">
              <Sparkle size={18} />
              <Sparkle size={7} className="absolute top-1.5 right-1.5 animate-twinkle" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] font-bold tracking-wide leading-tight">{t('app.title', lang)}</h1>
              <p className="text-[11px] text-muted leading-tight">{t('app.subtitle', lang)}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label={t('sidebar.closeMenu', lang)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-faint hover:text-ink hover:bg-hover transition-colors"
            >
              <IconBack size={16} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-raised border border-line px-2 py-0.5 text-muted">
              <IconPin size={12} />
              {locationLabel(location, lang)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-raised border border-line px-2 py-0.5 text-muted">
              {skyState === 'day' ? <IconSun size={12} /> : <IconMoon size={12} />}
              {t(`sky.${skyState}` as TranslationKey, lang)}
            </span>
          </div>
        </div>

        {/* Discovery progress */}
        <DiscoveryCard discovered={discoveredSet} lang={lang} onNext={discoverNext} />

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
            <input
              type="search"
              placeholder={t('sidebar.search', lang)}
              aria-label={t('sidebar.search', lang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setSearchQuery(''); }}
              className="w-full rounded-xl bg-raised border border-line pl-9 pr-9 py-2 text-sm text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label={t('sidebar.clearSearch', lang)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-faint hover:text-ink hover:bg-hover"
              >
                <IconClose size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label={t('app.title', lang)} className="mx-4 mb-2 grid grid-cols-4 gap-1 rounded-xl bg-raised p-1 border border-line">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-all duration-200 ${
                  active ? 'bg-surface-solid text-accent shadow-sm' : 'text-muted hover:text-ink hover:bg-hover'
                }`}
              >
                {tab.icon}
                <span className="leading-none">{t(tab.labelKey, lang)}</span>
                <span className={`absolute top-0.5 right-1 text-[9px] tabular ${active ? 'text-accent' : 'text-faint'}`}>{counts[tab.id]}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-4" role="tabpanel">
          {activeTab === 'constellations' && (
            <div key="c" className="animate-fade-in">
              <div className="flex gap-1.5 px-2 pb-2 overflow-x-auto scroll-thin" role="group">
                {([null, 'spring', 'summer', 'autumn', 'winter'] as const).map((s) => {
                  const active = season === s;
                  return (
                    <button
                      key={s ?? 'all'}
                      onClick={() => setSeason(s)}
                      aria-pressed={active}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs border transition-colors ${
                        active ? 'bg-accent-soft border-accent text-ink' : 'border-line text-muted hover:text-ink hover:bg-hover'
                      }`}
                    >
                      {s && <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEASON_COLOR[s] }} />}
                      {s ? t(SEASON_KEYS[s], lang) : t('sidebar.allSeasons', lang)}
                    </button>
                  );
                })}
              </div>
              {filteredConstellations.length === 0 && <EmptyState lang={lang} />}
              {filteredConstellations.map(c => {
                const isSelected = selectedBody?.id === c.id;
                const up = (constellationAlt.get(c.id) ?? -90) > 0;
                return (
                  <ListItem
                    key={c.id}
                    selected={isSelected}
                    discovered={discoveredSet.has(c.id)}
                    lang={lang}
                    onClick={() => select(constellationBody(c, dateTime, location))}
                    leading={
                      <span className={`flex items-center justify-center w-12 h-12 rounded-xl border transition-colors ${isSelected ? 'bg-accent-soft border-accent/40' : 'bg-raised border-line group-hover:border-nebula/40'}`}>
                        <ConstellationThumb constellation={c} size={42} highlight={isSelected} />
                      </span>
                    }
                    title={localizedName(c.nameJa, c.nameEn, lang)}
                    subtitle={lang === 'ja' ? c.nameEn : c.nameJa}
                    trailing={
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEASON_COLOR[c.season] }} />
                          {t(SEASON_KEYS[c.season], lang)}
                        </span>
                        <UpBadge up={up} lang={lang} />
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'stars' && (
            <div key="s" className="animate-fade-in">
              {filteredStars.length === 0 && <EmptyState lang={lang} />}
              {filteredStars.map(s => {
                const isSelected = selectedBody?.id === s.id;
                const glow = Math.max(4, (3 - s.mag) * 3.2);
                const con = constellationById.get(s.constellation);
                return (
                  <ListItem
                    key={s.id}
                    selected={isSelected}
                    discovered={discoveredSet.has(s.id)}
                    lang={lang}
                    onClick={() => select(starBody(s, dateTime, location))}
                    leading={
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-chip">
                        <span
                          className="rounded-full transition-transform duration-300 group-hover:scale-125"
                          style={{ width: glow, height: glow, background: `radial-gradient(circle, #fff 0%, ${s.color} 55%, transparent 100%)`, boxShadow: `0 0 ${glow * 1.4}px ${s.color}` }}
                        />
                      </span>
                    }
                    title={localizedName(s.nameJa, s.nameEn, lang)}
                    subtitle={`${lang === 'ja' ? s.nameEn : s.nameJa}${con ? ` · ${localizedName(con.nameJa, con.nameEn, lang)}` : ''}`}
                    trailing={<span className="text-xs text-muted tabular">{s.mag.toFixed(1)}{t('sidebar.magnitude', lang)}</span>}
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'planets' && (
            <div key="p" className="animate-fade-in">
              {filteredSpecial.length + filteredPlanets.length === 0 && <EmptyState lang={lang} />}
              {filteredSpecial.length > 0 && <SectionLabel>{t('sidebar.sunMoon', lang)}</SectionLabel>}
              {filteredSpecial.map(b => {
                const body = solarBodies.get(b.id);
                return (
                  <ListItem
                    key={b.id}
                    selected={selectedBody?.id === b.id}
                    discovered={discoveredSet.has(b.id)}
                    lang={lang}
                    onClick={() => select(specialBody(b, dateTime, location))}
                    leading={
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-chip">
                        {b.id === 'moon'
                          ? <MoonPhaseIcon phase={moonPhase.phase} size={30} />
                          : <span className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, #fff7d1 30%, #ffc94a 70%)', boxShadow: '0 0 14px #ffc94a' }} />}
                      </span>
                    }
                    title={localizedName(b.nameJa, b.nameEn, lang)}
                    subtitle={b.id === 'moon' ? `${getMoonPhaseName(moonPhase.phase, lang)} · ${Math.round(moonPhase.illumination * 100)}%` : (lang === 'ja' ? b.nameEn : b.nameJa)}
                    trailing={body && <UpBadge up={!!body.isVisible} lang={lang} />}
                  />
                );
              })}

              {filteredPlanets.length > 0 && <SectionLabel>{t('sidebar.planets', lang)}</SectionLabel>}
              {filteredPlanets.map(p => {
                const body = solarBodies.get(p.id);
                return (
                  <ListItem
                    key={p.id}
                    selected={selectedBody?.id === p.id}
                    discovered={discoveredSet.has(p.id)}
                    lang={lang}
                    onClick={() => select(planetBody(p, dateTime, location))}
                    leading={
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-full text-lg font-semibold bg-sky-chip"
                        style={{ color: p.color, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.color} 35%, transparent), 0 0 12px -4px ${p.color}` }}
                      >
                        {textSymbol(p.symbol)}
                      </span>
                    }
                    title={localizedName(p.nameJa, p.nameEn, lang)}
                    subtitle={lang === 'ja' ? p.nameEn : p.nameJa}
                    trailing={body && <UpBadge up={!!body.isVisible} lang={lang} />}
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'visible' && (
            <div key="v" className="animate-fade-in px-2">
              <div className="rounded-2xl border border-line bg-raised p-3 mb-3">
                <p className="text-xs font-semibold text-muted mb-2">{t('sidebar.tonight', lang)}</p>
                <div className="flex items-center gap-3 mb-3">
                  <MoonPhaseIcon phase={moonPhase.phase} size={48} />
                  <div>
                    <p className="text-sm font-semibold">{getMoonPhaseName(moonPhase.phase, lang)}</p>
                    <p className="text-xs text-muted">
                      {t('sidebar.illumination', lang)} {Math.round(moonPhase.illumination * 100)}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {([
                    ['sidebar.sunrise', sunTimes.sunrise, <IconSun size={14} key="a" />],
                    ['sidebar.sunset', sunTimes.sunset, <IconSun size={14} key="b" className="opacity-60" />],
                    ['sidebar.moonrise', moonTimes.rise, <IconMoon size={14} key="c" />],
                    ['sidebar.moonset', moonTimes.set, <IconMoon size={14} key="d" className="opacity-60" />],
                  ] as const).map(([key, time, icon]) => (
                    <div key={key} className="flex items-center gap-2 rounded-lg bg-raised px-2 py-1.5">
                      <span className="text-accent">{icon}</span>
                      <span className="text-muted">{t(key, lang)}</span>
                      <span className="ml-auto font-semibold tabular">{formatTime(time)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <SectionLabel>
                {t('sidebar.visibleNow', lang)} <span className="tabular">({visibleCount})</span>
              </SectionLabel>
              {visibleBodies
                .filter(b => b.isVisible)
                .sort((a, b) => (a.mag ?? 99) - (b.mag ?? 99))
                .map(body => (
                  <ListItem
                    key={body.id}
                    selected={selectedBody?.id === body.id}
                    discovered={discoveredSet.has(body.id)}
                    lang={lang}
                    onClick={() => select(body)}
                    className="-mx-2"
                    leading={<TypeBadge type={body.type} lang={lang} />}
                    title={localizedName(body.nameJa, body.nameEn, lang)}
                    subtitle={
                      body.alt != null && body.az != null
                        ? `${directionName(body.az, lang)} · ${t('detail.height', lang)} ${body.alt.toFixed(0)}°`
                        : undefined
                    }
                    trailing={body.mag != null && <span className="text-xs text-muted tabular">{body.mag.toFixed(1)}{t('sidebar.magnitude', lang)}</span>}
                  />
                ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── 部品 ─────────────────────────────────────────────

function DiscoveryCard({ discovered, lang, onNext }: { discovered: Set<string>; lang: 'ja' | 'en'; onNext: () => void }) {
  const total = DISCOVERY_TOTAL;
  const found = [...discovered].filter((id) => Object.values(DISCOVERY_IDS).some((ids) => ids.includes(id))).length;
  const ratio = found / total;
  const R = 22;
  const C = 2 * Math.PI * R;
  const cats: DiscoveryCategory[] = ['constellation', 'star', 'solar'];

  return (
    <div className="mx-4 rounded-2xl border border-line bg-gradient-to-br from-accent-soft via-transparent to-nebula-soft p-3">
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0" role="img" aria-label={`${t('discover.title', lang)} ${found} / ${total}`}>
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90" aria-hidden="true">
            <circle cx="28" cy="28" r={R} fill="none" stroke="var(--line)" strokeWidth="5" />
            <circle
              cx="28" cy="28" r={R} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - ratio)}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="text-sm font-bold tabular">{found}</span>
            <span className="text-[9px] text-muted tabular">/{total}</span>
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold flex items-center gap-1">
            <Sparkle size={10} className="text-accent" />
            {t('discover.title', lang)}
          </p>
          <div className="mt-1.5 space-y-1">
            {cats.map((cat) => {
              const ids = DISCOVERY_IDS[cat];
              const n = ids.filter((id) => discovered.has(id)).length;
              return (
                <div key={cat} className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="w-[4.75rem] shrink-0 truncate">{t(`discover.cat.${cat}` as TranslationKey, lang)}</span>
                  <span className="flex-1 h-1 rounded-full bg-raised overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
                      style={{ width: `${(n / ids.length) * 100}%` }}
                    />
                  </span>
                  <span className="tabular w-8 text-right">{n}/{ids.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <button
        onClick={onNext}
        title={t('discover.nextHint', lang)}
        className="group mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent text-accent-ink text-sm font-semibold py-2 shadow-[0_6px_20px_-8px_var(--accent)] hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <Sparkle size={14} className="transition-transform duration-500 group-hover:rotate-90" />
        {t('discover.next', lang)}
      </button>
    </div>
  );
}

function ListItem({
  selected, discovered, lang, onClick, leading, title, subtitle, trailing, className = '',
}: {
  selected: boolean;
  discovered: boolean;
  lang: 'ja' | 'en';
  onClick: () => void;
  leading: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={selected ? 'true' : undefined}
      className={`group w-full text-left flex items-center gap-3 px-2 py-2 rounded-xl mb-0.5 border transition-all duration-200 ${
        selected ? 'bg-accent-soft border-accent/40' : 'border-transparent hover:bg-hover hover:translate-x-0.5'
      } ${className}`}
    >
      <span className="shrink-0">{leading}</span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-sm truncate">{title}</span>
          {discovered && (
            <span className="text-accent shrink-0" title={t('discover.discovered', lang)}>
              <IconCheck size={13} strokeWidth={2.6} />
              <span className="sr-only">{t('discover.discovered', lang)}</span>
            </span>
          )}
        </span>
        {subtitle && <span className="block text-xs text-muted truncate mt-0.5">{subtitle}</span>}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </button>
  );
}

function UpBadge({ up, lang }: { up: boolean; lang: 'ja' | 'en' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${up ? 'bg-ok-soft text-ok' : 'bg-off-soft text-off'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${up ? 'bg-ok' : 'bg-off/60'}`} />
      {up ? t('sidebar.aboveHorizon', lang) : t('sidebar.belowHorizon', lang)}
    </span>
  );
}

function TypeBadge({ type, lang }: { type: CelestialBody['type']; lang: 'ja' | 'en' }) {
  const styles: Record<string, string> = {
    star: 'bg-accent-soft text-accent',
    planet: 'bg-nebula-soft text-nebula',
    moon: 'bg-raised text-ink',
  };
  const labelKey: Record<string, TranslationKey> = {
    star: 'sidebar.typeStar',
    planet: 'sidebar.typePlanet',
    moon: 'sidebar.typeMoon',
  };
  if (!labelKey[type]) return null;
  return (
    <span className={`inline-flex items-center justify-center min-w-10 rounded-lg px-1.5 py-1 text-[10px] font-semibold ${styles[type]}`}>
      {t(labelKey[type], lang)}
    </span>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wider text-faint px-2 pt-3 pb-1.5">{children}</p>;
}

function EmptyState({ lang }: { lang: 'ja' | 'en' }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10 text-muted">
      <Sparkle size={22} className="text-faint mb-2 animate-twinkle" />
      <p className="text-sm">{t('sidebar.noResults', lang)}</p>
    </div>
  );
}
