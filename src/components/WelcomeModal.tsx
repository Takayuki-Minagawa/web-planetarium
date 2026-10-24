import { useMemo, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { constellations } from '../data/constellations';
import { stars } from '../data/stars';
import { planets, specialBodies } from '../data/planets';
import { getMoonPhase, getSkyState } from '../utils/astronomy';
import { constellationBody, starBody, planetBody, specialBody, textSymbol } from '../utils/bodies';
import { t, localizedName, getMoonPhaseName, directionName, locationLabel } from '../i18n/translations';
import type { CelestialBody, Constellation } from '../types/celestial';
import Modal from './ui/Modal';
import { ConstellationThumb, MoonPhaseIcon } from './ui/Visuals';
import { Sparkle, IconHand, IconTap, IconBook } from './ui/Icons';

const SEASON_BY_MONTH: Constellation['season'][] = [
  'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
  'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
];

// ヒーローの飾りには最も形のわかりやすい星座を使う
const HERO_CONSTELLATION = constellations.reduce((a, b) => (b.lines.length > a.lines.length ? b : a));

// 背景の飾りの星（位置は固定）
const DECOR_STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37.7) % 100,
  y: (i * 61.3) % 100,
  r: 0.4 + ((i * 7) % 5) * 0.18,
  delay: (i % 7) * 0.45,
}));

export default function WelcomeModal() {
  const { welcomeOpen, setWelcomeOpen, dateTime, location, lang, setDateTime, focusBody } = useAppStore(useShallow((s) => ({
    welcomeOpen: s.welcomeOpen,
    setWelcomeOpen: s.setWelcomeOpen,
    dateTime: s.dateTime,
    location: s.location,
    lang: s.lang,
    setDateTime: s.setDateTime,
    focusBody: s.focusBody,
  })));

  // 明るい時間帯なら今夜21時の空でおすすめを選ぶ
  const highlights = useMemo(() => {
    const state = getSkyState(dateTime, location);
    const isLight = state === 'day' || state === 'civil_twilight';
    const target = new Date(dateTime);
    if (isLight) target.setHours(21, 0, 0, 0);

    const moonData = specialBodies.find((b) => b.id === 'moon')!;
    const moon = specialBody(moonData, target, location);
    const phase = getMoonPhase(target);

    const planetsUp = planets
      .map((p) => ({ p, body: planetBody(p, target, location) }))
      .filter((x): x is { p: typeof x.p; body: CelestialBody } => !!x.body?.isVisible)
      .sort((a, b) => (a.body.mag ?? 99) - (b.body.mag ?? 99));

    const brightest = stars
      .map((s) => ({ s, body: starBody(s, target, location) }))
      .filter((x) => (x.body.alt ?? -90) > 10)
      .sort((a, b) => a.s.mag - b.s.mag)[0];

    const season = SEASON_BY_MONTH[target.getMonth()];
    const cons = constellations
      .map((c) => ({ c, body: constellationBody(c, target, location) }))
      .filter((x): x is { c: Constellation; body: CelestialBody } => !!x.body && (x.body.alt ?? -90) > 15)
      .sort((a, b) => {
        const sa = a.c.season === season ? 1 : 0;
        const sb = b.c.season === season ? 1 : 0;
        return sb - sa || (b.body.alt ?? 0) - (a.body.alt ?? 0);
      });

    return { isLight, target, moon, phase, planetsUp, brightest, constellation: cons[0] };
  }, [dateTime, location]);

  if (!welcomeOpen) return null;

  const close = () => setWelcomeOpen(false);
  const go = (body: CelestialBody) => {
    if (highlights.isLight) setDateTime(highlights.target);
    focusBody(body);
    close();
  };

  const { moon, phase, planetsUp, brightest, constellation } = highlights;

  return (
    <Modal onClose={close} labelledBy="welcome-title" className="sm:max-w-xl">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6 bg-[radial-gradient(120%_120%_at_80%_0%,#2a2f6e_0%,#0d1236_45%,#060818_100%)] text-white">
        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
          {DECOR_STARS.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="#fff"
              className="animate-twinkle"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}
        </svg>
        <div className="absolute -right-6 -top-3 opacity-40 sm:opacity-80 [--accent:#f6c870]" aria-hidden="true">
          <ConstellationThumb constellation={HERO_CONSTELLATION} size={180} highlight />
        </div>
        <div className="relative max-w-[22rem]">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#f6c870]">
            <Sparkle size={10} /> {t('welcome.kicker', lang)}
          </p>
          <h2 id="welcome-title" className="mt-2 text-2xl sm:text-[28px] font-bold leading-snug">
            {t('welcome.title', lang)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{t('welcome.lead', lang)}</p>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Sparkle size={12} className="text-accent" />
            {t('welcome.highlights', lang)}
          </h3>
          <span className="text-[11px] text-muted truncate">
            {locationLabel(location, lang)}
          </span>
        </div>
        {highlights.isLight && <p className="text-xs text-muted mb-3 -mt-1">{t('welcome.dayNote', lang)}</p>}

        <div className="grid grid-cols-2 gap-2">
          <HighlightCard
            label={t('welcome.moon', lang)}
            icon={<MoonPhaseIcon phase={phase.phase} size={36} />}
            title={getMoonPhaseName(phase.phase, lang)}
            detail={`${Math.round(phase.illumination * 100)}%${moon.isVisible ? ` · ${directionName(moon.az!, lang)}` : ''}`}
            onClick={() => go(moon)}
            delay={0}
          />
          {brightest && (
            <HighlightCard
              label={t('welcome.brightest', lang)}
              icon={
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-chip">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ background: `radial-gradient(circle, #fff 0%, ${brightest.s.color} 55%, transparent 100%)`, boxShadow: `0 0 14px ${brightest.s.color}` }}
                  />
                </span>
              }
              title={localizedName(brightest.s.nameJa, brightest.s.nameEn, lang)}
              detail={`${brightest.s.mag.toFixed(1)}${t('sidebar.magnitude', lang)} · ${directionName(brightest.body.az!, lang)}`}
              onClick={() => go(brightest.body)}
              delay={60}
            />
          )}
          {constellation && (
            <HighlightCard
              label={t('welcome.constellation', lang)}
              icon={<ConstellationThumb constellation={constellation.c} size={36} highlight />}
              title={localizedName(constellation.c.nameJa, constellation.c.nameEn, lang)}
              detail={directionName(constellation.body.az!, lang)}
              onClick={() => go(constellation.body)}
              delay={120}
            />
          )}
          <div className="rounded-2xl border border-line bg-raised p-3 animate-rise-in" style={{ animationDelay: '180ms' }}>
            <p className="text-[11px] font-semibold text-muted">{t('welcome.planets', lang)}</p>
            {planetsUp.length === 0 ? (
              <p className="text-sm font-semibold mt-1.5 text-muted">{t('welcome.noPlanets', lang)}</p>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {planetsUp.map(({ p, body }) => (
                  <button
                    key={p.id}
                    onClick={() => go(body)}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border border-line hover:border-accent/50 hover:bg-accent-soft transition-colors"
                  >
                    <span style={{ color: p.color }}>{textSymbol(p.symbol)}</span>
                    {localizedName(p.nameJa, p.nameEn, lang)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <ul className="mt-5 grid grid-cols-3 gap-2 text-center">
          {([
            [<IconHand size={20} key="h" />, t('welcome.tip.drag', lang)],
            [<IconTap size={20} key="t" />, t('welcome.tip.tap', lang)],
            [<IconBook size={20} key="b" />, t('welcome.tip.collect', lang)],
          ] as const).map(([icon, text]) => (
            <li key={text} className="flex flex-col items-center gap-1.5 text-[11px] leading-snug text-muted">
              <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-nebula-soft text-nebula">{icon}</span>
              {text}
            </li>
          ))}
        </ul>

        <button
          data-autofocus
          onClick={close}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-accent text-accent-ink font-bold py-3 shadow-[0_10px_30px_-10px_var(--accent)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Sparkle size={14} />
          {t('welcome.start', lang)}
        </button>
      </div>
    </Modal>
  );
}

function HighlightCard({ label, icon, title, detail, onClick, delay }: {
  label: string;
  icon: ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl border border-line bg-raised p-3 hover:border-accent/50 hover:bg-accent-soft hover:-translate-y-0.5 transition-all animate-rise-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-[11px] font-semibold text-muted">{label}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="shrink-0 flex items-center justify-center w-9 h-9 transition-transform duration-300 group-hover:scale-110">{icon}</span>
        <span className="min-w-0">
          <span className="block text-sm font-bold truncate">{title}</span>
          <span className="block text-[11px] text-muted truncate">{detail}</span>
        </span>
      </div>
    </button>
  );
}
