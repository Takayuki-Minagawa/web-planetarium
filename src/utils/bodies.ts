import { constellations } from '../data/constellations';
import { stars } from '../data/stars';
import { planets, specialBodies } from '../data/planets';
import {
  equatorialToHorizontal,
  getPlanetPosition,
  getSunPosition,
  getMoonPosition,
  getMoonPhase,
} from './astronomy';
import { getMoonPhaseName } from '../i18n/translations';
import type { CelestialBody, Constellation, ObserverLocation, Planet, Star } from '../types/celestial';

type SpecialBody = typeof specialBodies[number];

export const starById = new Map(stars.map((s) => [s.id, s]));
export const constellationById = new Map(constellations.map((c) => [c.id, c]));

// 星座の代表位置（主な星の平均）
export function constellationCenter(c: Constellation): { ra: number; dec: number } | null {
  const mainStars = c.mainStars.map((id) => starById.get(id)).filter((s): s is Star => !!s);
  if (mainStars.length === 0) return null;
  let sumRa = 0, sumDec = 0;
  for (const s of mainStars) {
    sumRa += s.ra;
    sumDec += s.dec;
  }
  return { ra: sumRa / mainStars.length, dec: sumDec / mainStars.length };
}

export function constellationBody(c: Constellation, date: Date, location: ObserverLocation): CelestialBody | null {
  const center = constellationCenter(c);
  if (!center) return null;
  const pos = equatorialToHorizontal(center.ra, center.dec, date, location);
  return {
    id: c.id,
    nameJa: c.nameJa,
    nameEn: c.nameEn,
    type: 'constellation',
    alt: pos.alt,
    az: pos.az,
    isVisible: pos.alt > 0,
    description: c.description,
    descriptionEn: c.descriptionEn,
  };
}

export function starBody(s: Star, date: Date, location: ObserverLocation): CelestialBody {
  const pos = equatorialToHorizontal(s.ra, s.dec, date, location);
  return {
    id: s.id,
    nameJa: s.nameJa,
    nameEn: s.nameEn,
    type: 'star',
    ra: s.ra,
    dec: s.dec,
    alt: pos.alt,
    az: pos.az,
    mag: s.mag,
    isVisible: pos.alt > 0,
    description: s.description,
    descriptionEn: s.descriptionEn,
  };
}

export function planetBody(p: Planet, date: Date, location: ObserverLocation): CelestialBody | null {
  const pos = getPlanetPosition(p.id, date, location);
  if (!pos) return null;
  const horizPos = equatorialToHorizontal(pos.ra, pos.dec, date, location);
  return {
    id: p.id,
    nameJa: p.nameJa,
    nameEn: p.nameEn,
    type: 'planet',
    ra: pos.ra,
    dec: pos.dec,
    alt: horizPos.alt,
    az: horizPos.az,
    mag: pos.mag,
    isVisible: horizPos.alt > 0,
    description: p.description,
    descriptionEn: p.descriptionEn,
  };
}

export function specialBody(b: SpecialBody, date: Date, location: ObserverLocation): CelestialBody {
  const pos = b.id === 'sun' ? getSunPosition(date, location) : getMoonPosition(date, location);
  const horizPos = equatorialToHorizontal(pos.ra, pos.dec, date, location);

  let description = b.description;
  let descriptionEn = b.descriptionEn;
  if (b.id === 'moon') {
    const phase = getMoonPhase(date);
    const pct = Math.round(phase.illumination * 100);
    description = `${getMoonPhaseName(phase.phase, 'ja')}（${pct}%）`;
    descriptionEn = `${getMoonPhaseName(phase.phase, 'en')} (${pct}%)`;
  }

  return {
    id: b.id,
    nameJa: b.nameJa,
    nameEn: b.nameEn,
    type: b.id as 'sun' | 'moon',
    ra: pos.ra,
    dec: pos.dec,
    alt: horizPos.alt,
    az: horizPos.az,
    isVisible: horizPos.alt > 0,
    description,
    descriptionEn,
  };
}

// ID から天体情報を組み立てる
export function bodyById(id: string, date: Date, location: ObserverLocation): CelestialBody | null {
  const c = constellationById.get(id);
  if (c) return constellationBody(c, date, location);
  const s = starById.get(id);
  if (s) return starBody(s, date, location);
  const p = planets.find((p) => p.id === id);
  if (p) return planetBody(p, date, location);
  const b = specialBodies.find((b) => b.id === id);
  if (b) return specialBody(b, date, location);
  return null;
}

// ─── 星空図鑑（発見の記録） ─────────────────────────────

export type DiscoveryCategory = 'constellation' | 'star' | 'solar';

export const DISCOVERY_IDS: Record<DiscoveryCategory, string[]> = {
  constellation: constellations.map((c) => c.id),
  star: stars.map((s) => s.id),
  solar: [...specialBodies.map((b) => b.id), ...planets.map((p) => p.id)],
};

export const DISCOVERY_TOTAL =
  DISCOVERY_IDS.constellation.length + DISCOVERY_IDS.star.length + DISCOVERY_IDS.solar.length;

export function discoveryCategoryOf(id: string): DiscoveryCategory | null {
  for (const cat of Object.keys(DISCOVERY_IDS) as DiscoveryCategory[]) {
    if (DISCOVERY_IDS[cat].includes(id)) return cat;
  }
  return null;
}

// テキスト表示用（絵文字ではなく文字として表示させる）
export function textSymbol(symbol: string): string {
  return `${symbol}︎`;
}
