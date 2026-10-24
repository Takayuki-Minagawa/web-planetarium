import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { stars } from '../data/stars';
import { planets } from '../data/planets';
import { specialBodies } from '../data/planets';
import { getMoonPhase } from '../utils/astronomy';
import { constellationById, starById, constellationBody, starBody, textSymbol, bodyById } from '../utils/bodies';
import {
  t, localizedName, getMoonPhaseName, directionName, altitudeDescription, brightnessDescription, type TranslationKey,
} from '../i18n/translations';
import { ConstellationThumb, MoonPhaseIcon, SkyDome, MagnitudeMeter } from './ui/Visuals';
import { IconClose, Sparkle, IconBook } from './ui/Icons';

function formatDegrees(deg: number | undefined): string {
  if (deg == null) return '--';
  return `${deg.toFixed(1)}°`;
}

function formatRA(ra: number | undefined): string {
  if (ra == null) return '--';
  const h = Math.floor(ra);
  const m = Math.floor((ra - h) * 60);
  const s = Math.round(((ra - h) * 60 - m) * 60);
  return `${h}h ${m}m ${s}s`;
}

export default function DetailPanel() {
  const { picked, setSelectedBody, focusBody, lang, dateTime, location } = useAppStore(useShallow((s) => ({
    picked: s.selectedBody,
    setSelectedBody: s.setSelectedBody,
    focusBody: s.focusBody,
    lang: s.lang,
    dateTime: s.panelDateTime,
    location: s.location,
  })));
  const scrollRef = useRef<HTMLDivElement>(null);

  // 時刻が進んでも位置・見え方が最新になるよう、選択時の値ではなく現在の日時で計算し直す
  const selectedBody = useMemo(
    () => (picked ? (bodyById(picked.id, dateTime, location) ?? picked) : null),
    [picked, dateTime, location]
  );

  // 別の天体を選んだら先頭までスクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [picked?.id]);

  // クリック時点の正確な日時（パネル表示用の日時は早送り中に間引かれるため）
  const at = () => useAppStore.getState().dateTime;

  if (!selectedBody) return null;

  let mythology = '';
  let mythologyEn = '';
  let extraDescription = '';
  let extraDescriptionEn = '';
  let accent = 'var(--accent)';

  const constellation = selectedBody.type === 'constellation' ? constellationById.get(selectedBody.id) : undefined;
  const star = selectedBody.type === 'star' ? starById.get(selectedBody.id) : undefined;
  const planet = selectedBody.type === 'planet' ? planets.find(p => p.id === selectedBody.id) : undefined;
  const special = specialBodies.find(b => b.id === selectedBody.id);

  if (constellation) {
    mythology = constellation.mythology;
    mythologyEn = constellation.mythologyEn;
    extraDescription = constellation.description;
    extraDescriptionEn = constellation.descriptionEn;
  } else if (star) {
    extraDescription = star.description;
    extraDescriptionEn = star.descriptionEn;
    accent = star.color;
  } else if (planet) {
    extraDescription = planet.description;
    extraDescriptionEn = planet.descriptionEn;
    accent = planet.color;
  } else if (special) {
    extraDescription = special.description;
    extraDescriptionEn = special.descriptionEn;
    accent = special.color;
  }

  const description = lang === 'ja'
    ? (selectedBody.description || extraDescription)
    : (selectedBody.descriptionEn || extraDescriptionEn);

  const mythText = lang === 'ja' ? mythology : mythologyEn;
  const moonPhase = selectedBody.type === 'moon' ? getMoonPhase(dateTime) : null;

  // 関連する天体（星座 ⇄ 恒星）
  const relatedStars = constellation
    ? constellation.mainStars.map((id) => starById.get(id)).filter((s) => !!s)
    : [];
  const parentConstellation = star ? constellationById.get(star.constellation) : undefined;
  const siblingStars = star ? stars.filter((s) => s.constellation === star.constellation && s.id !== star.id) : [];

  const hasPosition = selectedBody.alt != null && selectedBody.az != null;

  return (
    <section
      key={selectedBody.id}
      aria-label={localizedName(selectedBody.nameJa, selectedBody.nameEn, lang)}
      className="panel fixed z-40 text-ink overflow-hidden flex flex-col animate-rise-in
        inset-x-0 bottom-0 max-h-[58dvh] rounded-t-3xl bg-surface-solid md:bg-surface
        md:inset-x-auto md:bottom-4 md:right-4 md:w-[23rem] md:max-h-[calc(100dvh-17rem)] md:rounded-3xl"
    >
      {/* Mobile handle */}
      <div className="md:hidden flex justify-center pt-2" aria-hidden="true">
        <span className="w-10 h-1 rounded-full bg-line" />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-3 px-4 pt-3 md:pt-4 pb-3">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: `radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, ${accent} 22%, transparent), transparent 60%)` }}
          aria-hidden="true"
        />
        <div className={`relative shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl border border-line animate-pop ${constellation ? 'bg-raised' : 'bg-sky-chip'}`}>
          {constellation && <ConstellationThumb constellation={constellation} size={48} highlight />}
          {star && (
            <span
              className="rounded-full"
              style={{
                width: Math.max(10, (3 - star.mag) * 5),
                height: Math.max(10, (3 - star.mag) * 5),
                background: `radial-gradient(circle, #fff 0%, ${star.color} 55%, transparent 100%)`,
                boxShadow: `0 0 22px ${star.color}`,
              }}
            />
          )}
          {planet && <span className="text-2xl font-semibold" style={{ color: planet.color }}>{textSymbol(planet.symbol)}</span>}
          {moonPhase && <MoonPhaseIcon phase={moonPhase.phase} size={46} />}
          {selectedBody.type === 'sun' && (
            <span className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, #fff7d1 30%, #ffc94a 70%)', boxShadow: '0 0 22px #ffc94a' }} />
          )}
        </div>
        <div className="relative flex-1 min-w-0">
          <h2 className="text-xl font-bold leading-tight truncate">{localizedName(selectedBody.nameJa, selectedBody.nameEn, lang)}</h2>
          <p className="text-sm text-muted truncate">{lang === 'ja' ? selectedBody.nameEn : selectedBody.nameJa}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-nebula-soft text-nebula font-medium">
              {t(`detail.type.${selectedBody.type}` as TranslationKey, lang)}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${selectedBody.isVisible ? 'bg-ok-soft text-ok' : 'bg-off-soft text-off'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedBody.isVisible ? 'bg-ok' : 'bg-off/60'}`} />
              {selectedBody.isVisible ? t('detail.visible', lang) : t('detail.notVisible', lang)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSelectedBody(null)}
          aria-label={t('detail.close', lang)}
          className="relative self-start p-1.5 rounded-xl text-muted hover:text-ink hover:bg-hover transition-colors"
        >
          <IconClose size={20} />
        </button>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 pb-4 space-y-3">
        {/* Where in the sky */}
        {hasPosition && (
          <div className="rounded-2xl border border-line bg-raised p-3 flex items-center gap-3">
            <SkyDome alt={selectedBody.alt!} az={selectedBody.az!} lang={lang} size={92} color={selectedBody.type === 'constellation' ? 'var(--accent)' : accent} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted">{t('detail.where', lang)}</p>
              {selectedBody.alt! > 0 ? (
                <>
                  <p className="text-base font-bold mt-0.5">
                    {`${directionName(selectedBody.az!, lang)}${t('detail.inSky', lang)}`.replace(/^./, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {t('detail.height', lang)} <span className="tabular text-ink font-semibold">{selectedBody.alt!.toFixed(0)}°</span>
                    {' · '}{altitudeDescription(selectedBody.alt!, lang)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold mt-0.5">{t('detail.belowHorizon', lang)}</p>
                  <p className="text-xs text-muted mt-0.5 tabular">{directionName(selectedBody.az!, lang)} · {selectedBody.alt!.toFixed(0)}°</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Moon phase */}
        {moonPhase && (
          <div className="rounded-2xl border border-line bg-raised p-3">
            <p className="text-[11px] font-semibold text-muted">{t('detail.phase', lang)}</p>
            <p className="text-base font-bold mt-0.5">{getMoonPhaseName(moonPhase.phase, lang)}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-raised overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-[#fff3c9] transition-[width] duration-700" style={{ width: `${moonPhase.illumination * 100}%` }} />
              </div>
              <span className="text-xs tabular text-muted">{t('sidebar.illumination', lang)} {Math.round(moonPhase.illumination * 100)}%</span>
            </div>
          </div>
        )}

        {/* Brightness */}
        {selectedBody.mag != null && (
          <div className="rounded-2xl border border-line bg-raised p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[11px] font-semibold text-muted">{t('detail.brightness', lang)}</p>
              <p className="text-xs">
                <span className="font-bold tabular text-sm">{selectedBody.mag.toFixed(2)}</span>
                <span className="text-muted">{t('sidebar.magnitude', lang)} · {brightnessDescription(selectedBody.mag, lang)}</span>
              </p>
            </div>
            <div className="mt-2">
              <MagnitudeMeter mag={selectedBody.mag} color={accent} />
            </div>
            <p className="text-[11px] text-faint mt-1.5 leading-relaxed">{t('detail.magHint', lang)}</p>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm leading-relaxed text-ink/90">{description}</p>
        )}

        {/* Mythology */}
        {mythText && (
          <div className="relative rounded-2xl p-3 border border-nebula/25 bg-nebula-soft overflow-hidden">
            <Sparkle size={44} className="absolute -right-2 -top-2 text-nebula opacity-15" />
            <p className="text-xs font-semibold mb-1 text-nebula flex items-center gap-1.5">
              <IconBook size={14} />
              {t('detail.mythology', lang)}
            </p>
            <p className="text-sm leading-relaxed text-ink/90">{mythText}</p>
          </div>
        )}

        {/* Related */}
        {relatedStars.length > 0 && (
          <RelatedChips
            title={t('detail.mainStars', lang)}
            items={relatedStars.map((s) => ({
              id: s.id,
              label: localizedName(s.nameJa, s.nameEn, lang),
              color: s.color,
              onClick: () => focusBody(starBody(s, at(), location)),
            }))}
          />
        )}
        {parentConstellation && (
          <RelatedChips
            title={t('detail.inConstellation', lang)}
            items={[
              {
                id: parentConstellation.id,
                label: localizedName(parentConstellation.nameJa, parentConstellation.nameEn, lang),
                onClick: () => {
                  const body = constellationBody(parentConstellation, at(), location);
                  if (body) focusBody(body);
                },
              },
              ...siblingStars.map((s) => ({
                id: s.id,
                label: localizedName(s.nameJa, s.nameEn, lang),
                color: s.color,
                onClick: () => focusBody(starBody(s, at(), location)),
              })),
            ]}
          />
        )}

        {/* Observation data */}
        <details className="group rounded-2xl border border-line bg-raised">
          <summary className="cursor-pointer list-none flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-muted [&::-webkit-details-marker]:hidden">
            {t('detail.data', lang)}
            <span className="transition-transform group-open:rotate-90" aria-hidden="true">›</span>
          </summary>
          <div className="grid grid-cols-2 gap-1.5 px-3 pb-3 text-sm">
            {selectedBody.mag != null && <DataCell label={t('detail.magnitude', lang)} value={selectedBody.mag.toFixed(2)} />}
            {selectedBody.ra != null && <DataCell label={t('detail.ra', lang)} value={formatRA(selectedBody.ra)} />}
            {selectedBody.dec != null && <DataCell label={t('detail.dec', lang)} value={formatDegrees(selectedBody.dec)} />}
            {selectedBody.alt != null && <DataCell label={t('detail.altitude', lang)} value={formatDegrees(selectedBody.alt)} />}
            {selectedBody.az != null && <DataCell label={t('detail.azimuth', lang)} value={formatDegrees(selectedBody.az)} />}
          </div>
        </details>
      </div>
    </section>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg px-2 py-1.5 bg-raised">
      <p className="text-[10px] text-faint">{label}</p>
      <p className="font-medium tabular">{value}</p>
    </div>
  );
}

function RelatedChips({ title, items }: { title: string; items: { id: string; label: string; color?: string; onClick: () => void }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted mb-1.5">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-raised px-2.5 py-1 text-xs hover:border-accent/50 hover:bg-accent-soft hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            {item.color
              ? <span className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              : <Sparkle size={10} className="text-accent" />}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
