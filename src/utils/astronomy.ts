import * as Astronomy from 'astronomy-engine';
import SunCalc from 'suncalc';
import { stars } from '../data/stars';
import { planets } from '../data/planets';
import type { ObserverLocation, CelestialBody } from '../types/celestial';

const PLANET_BODY_MAP: Record<string, Astronomy.Body> = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
};

export interface HorizontalPosition {
  alt: number; // altitude in degrees
  az: number;  // azimuth in degrees
}

// 赤経・赤緯から地平座標（高度・方位）に変換
export function equatorialToHorizontal(
  ra: number,   // 赤経 (時)
  dec: number,  // 赤緯 (度)
  date: Date,
  location: ObserverLocation
): HorizontalPosition {
  const time = Astronomy.MakeTime(date);
  // 恒星時を計算
  const lst = Astronomy.SiderealTime(time);
  // 時角 = 恒星時 - 赤経 + 経度/15
  let ha = lst - ra + location.longitude / 15;
  // 0-24時の範囲に正規化
  ha = ((ha % 24) + 24) % 24;
  // 時角をラジアンに
  const haRad = ha * 15 * Astronomy.DEG2RAD;
  const decRad = dec * Astronomy.DEG2RAD;
  const latRad = location.latitude * Astronomy.DEG2RAD;

  // 高度を計算
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const alt = Math.asin(sinAlt) * Astronomy.RAD2DEG;

  // 方位角を計算
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(alt * Astronomy.DEG2RAD));
  const sinAz = -Math.cos(decRad) * Math.sin(haRad) / Math.cos(alt * Astronomy.DEG2RAD);
  let az = Math.atan2(sinAz, cosAz) * Astronomy.RAD2DEG;
  az = ((az % 360) + 360) % 360;

  return { alt, az };
}

function makeObserver(location: ObserverLocation): Astronomy.Observer {
  return new Astronomy.Observer(location.latitude, location.longitude, 0);
}

// 惑星の赤道座標を取得
export function getPlanetPosition(planetId: string, date: Date, location: ObserverLocation): { ra: number; dec: number; mag: number } | null {
  const body = PLANET_BODY_MAP[planetId];
  if (!body) return null;

  const time = Astronomy.MakeTime(date);
  const eq = Astronomy.Equator(body, time, makeObserver(location), true, true);
  const illum = Astronomy.Illumination(body, time);

  return {
    ra: eq.ra,
    dec: eq.dec,
    mag: illum.mag,
  };
}

// 太陽の位置
export function getSunPosition(date: Date, location: ObserverLocation): { ra: number; dec: number } {
  const time = Astronomy.MakeTime(date);
  const eq = Astronomy.Equator(Astronomy.Body.Sun, time, makeObserver(location), true, true);
  return { ra: eq.ra, dec: eq.dec };
}

// 月の位置
export function getMoonPosition(date: Date, location: ObserverLocation): { ra: number; dec: number } {
  const time = Astronomy.MakeTime(date);
  const eq = Astronomy.Equator(Astronomy.Body.Moon, time, makeObserver(location), true, true);
  return { ra: eq.ra, dec: eq.dec };
}

// 月相を取得 (0-1: 0=新月, 0.25=上弦, 0.5=満月, 0.75=下弦)
export function getMoonPhase(date: Date): { phase: number; phaseName: string; illumination: number } {
  const time = Astronomy.MakeTime(date);
  const phaseAngle = Astronomy.MoonPhase(time);
  const phase = phaseAngle / 360;

  const illum = SunCalc.getMoonIllumination(date);

  let phaseName: string;
  if (phase < 0.0625) phaseName = '新月';
  else if (phase < 0.1875) phaseName = '三日月';
  else if (phase < 0.3125) phaseName = '上弦の月';
  else if (phase < 0.4375) phaseName = '十日夜の月';
  else if (phase < 0.5625) phaseName = '満月';
  else if (phase < 0.6875) phaseName = '十六夜の月';
  else if (phase < 0.8125) phaseName = '下弦の月';
  else if (phase < 0.9375) phaseName = '二十六夜の月';
  else phaseName = '新月';

  return { phase, phaseName, illumination: illum.fraction };
}

// 日の出・日の入り
export function getSunTimes(date: Date, location: ObserverLocation) {
  return SunCalc.getTimes(date, location.latitude, location.longitude);
}

// 月の出・月の入り
export function getMoonTimes(date: Date, location: ObserverLocation) {
  return SunCalc.getMoonTimes(date, location.latitude, location.longitude);
}

// 空の明るさ状態
export function getSkyState(date: Date, location: ObserverLocation): 'night' | 'astronomical_twilight' | 'nautical_twilight' | 'civil_twilight' | 'day' {
  const sunPos = SunCalc.getPosition(date, location.latitude, location.longitude);
  const sunAltDeg = sunPos.altitude * Astronomy.RAD2DEG;

  if (sunAltDeg > 0) return 'day';
  if (sunAltDeg > -6) return 'civil_twilight';
  if (sunAltDeg > -12) return 'nautical_twilight';
  if (sunAltDeg > -18) return 'astronomical_twilight';
  return 'night';
}

// 現在見えている天体リストを生成
export function getVisibleBodies(date: Date, location: ObserverLocation): CelestialBody[] {
  const bodies: CelestialBody[] = [];

  // 恒星の可視性チェック
  for (const star of stars) {
    const pos = equatorialToHorizontal(star.ra, star.dec, date, location);
    if (pos.alt > 0 && star.mag < 3.0) {
      bodies.push({
        id: star.id,
        nameJa: star.nameJa,
        nameEn: star.nameEn,
        type: 'star',
        ra: star.ra,
        dec: star.dec,
        alt: pos.alt,
        az: pos.az,
        mag: star.mag,
        isVisible: true,
        description: star.description,
      });
    }
  }

  // 惑星
  for (const planet of planets) {
    const planetPos = getPlanetPosition(planet.id, date, location);
    if (planetPos) {
      const horizPos = equatorialToHorizontal(planetPos.ra, planetPos.dec, date, location);
      bodies.push({
        id: planet.id,
        nameJa: planet.nameJa,
        nameEn: planet.nameEn,
        type: 'planet',
        ra: planetPos.ra,
        dec: planetPos.dec,
        alt: horizPos.alt,
        az: horizPos.az,
        mag: planetPos.mag,
        isVisible: horizPos.alt > 0,
        description: planet.description,
      });
    }
  }

  // 月
  const moonPos = getMoonPosition(date, location);
  const moonHoriz = equatorialToHorizontal(moonPos.ra, moonPos.dec, date, location);
  const moonPhase = getMoonPhase(date);
  bodies.push({
    id: 'moon',
    nameJa: '月',
    nameEn: 'Moon',
    type: 'moon',
    ra: moonPos.ra,
    dec: moonPos.dec,
    alt: moonHoriz.alt,
    az: moonHoriz.az,
    isVisible: moonHoriz.alt > 0,
    description: `${moonPhase.phaseName}（輝面比 ${Math.round(moonPhase.illumination * 100)}%）`,
  });

  return bodies;
}

// 星の赤道座標をステレオ投影でキャンバス座標に変換
export function projectStar(
  ra: number,
  dec: number,
  date: Date,
  location: ObserverLocation,
  canvasWidth: number,
  canvasHeight: number,
  centerAz: number,
  centerAlt: number,
  fov: number
): { x: number; y: number; visible: boolean } {
  const pos = equatorialToHorizontal(ra, dec, date, location);

  // 中心からの角度差を計算
  const dAz = pos.az - centerAz;
  const dAlt = pos.alt - centerAlt;

  // 正規化
  const normalizedDAz = ((dAz + 180) % 360) - 180;

  // FOV内かチェック
  const halfFov = fov / 2;
  const aspectRatio = canvasWidth / canvasHeight;

  if (Math.abs(normalizedDAz) > halfFov * aspectRatio || Math.abs(dAlt) > halfFov) {
    return { x: -1, y: -1, visible: false };
  }

  // キャンバス座標に変換
  const x = canvasWidth / 2 + (normalizedDAz / (halfFov * aspectRatio)) * (canvasWidth / 2);
  const y = canvasHeight / 2 - (dAlt / halfFov) * (canvasHeight / 2);

  return { x, y, visible: pos.alt > -2 };
}
