import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { stars } from '../data/stars';
import { constellations } from '../data/constellations';
import { planets, specialBodies } from '../data/planets';
import {
  siderealTime,
  equatorialToHorizontalAt,
  projectHorizontal,
  getPlanetPosition,
  getMoonPosition,
  getSunPosition,
  getMoonPhase,
  getSkyState,
  milkyWayPoints,
} from '../utils/astronomy';
import { bodyById, textSymbol, constellationById } from '../utils/bodies';
import { moonLitPath } from '../utils/moonPath';
import type { ObserverLocation, Planet, Star } from '../types/celestial';
import { t, localizedName, getMoonPhaseName } from '../i18n/translations';

const FONT = '"Inter", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif';
const ACCENT = '#f6c870';

type SkyState = ReturnType<typeof getSkyState>;

// 日時・地点が変わったときだけ計算する天体の地平座標
interface SkyModel {
  date: Date;
  location: ObserverLocation;
  skyState: SkyState;
  stars: { star: Star; alt: number; az: number; phase: number }[];
  starPos: Map<string, { alt: number; az: number }>;
  planets: { planet: Planet; alt: number; az: number; mag: number }[];
  moon: { alt: number; az: number; phase: number };
  sun: { alt: number; az: number };
  milkyWay: { alt: number; az: number; intensity: number }[];
}

function buildModel(date: Date, location: ObserverLocation): SkyModel {
  const gst = siderealTime(date);
  const toHz = (ra: number, dec: number) => equatorialToHorizontalAt(ra, dec, gst, location);

  const starList = stars.map((star, i) => ({ star, ...toHz(star.ra, star.dec), phase: (i * 2.399) % (Math.PI * 2) }));
  const planetList: SkyModel['planets'] = [];
  for (const planet of planets) {
    const pos = getPlanetPosition(planet.id, date, location);
    if (pos) planetList.push({ planet, ...toHz(pos.ra, pos.dec), mag: pos.mag });
  }
  const moonEq = getMoonPosition(date, location);
  const sunEq = getSunPosition(date, location);

  return {
    date,
    location,
    skyState: getSkyState(date, location),
    stars: starList,
    starPos: new Map(starList.map((s) => [s.star.id, { alt: s.alt, az: s.az }])),
    planets: planetList,
    moon: { ...toHz(moonEq.ra, moonEq.dec), phase: getMoonPhase(date).phase },
    sun: toHz(sunEq.ra, sunEq.dec),
    milkyWay: milkyWayPoints.map((p) => ({ ...toHz(p.ra, p.dec), intensity: p.intensity })),
  };
}

// 空の状態ごとの配色（天頂 → 地平線）
const SKY_COLORS: Record<SkyState, [string, string, string]> = {
  night: ['#03050f', '#0a1030', 'rgba(70, 90, 170, 0.18)'],
  astronomical_twilight: ['#050920', '#141b48', 'rgba(90, 100, 190, 0.22)'],
  nautical_twilight: ['#0a1238', '#2b3270', 'rgba(150, 120, 190, 0.28)'],
  civil_twilight: ['#18275a', '#5d5288', 'rgba(255, 160, 120, 0.35)'],
  day: ['#2b62a8', '#86b6e2', 'rgba(220, 235, 255, 0.35)'],
};

const MILKY_WAY_ALPHA: Record<SkyState, number> = {
  night: 1,
  astronomical_twilight: 0.55,
  nautical_twilight: 0.2,
  civil_twilight: 0,
  day: 0,
};

interface Hit {
  id: string;
  x: number;
  y: number;
  r: number;
}

interface LabelBox {
  id: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const modelRef = useRef<SkyModel | null>(null);
  const hitsRef = useRef<Hit[]>([]);
  const labelsRef = useRef<LabelBox[]>([]);
  const hoverRef = useRef<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startX: 0, startY: 0, moved: false, pinchDist: 0, pinchFov: 0 });
  const suppressClick = useRef(false);
  // 再描画が必要か（動きを減らす設定のときは変化があったときだけ描く）
  const dirtyRef = useRef(true);

  const lang = useAppStore((s) => s.lang);

  const getModel = useCallback(() => {
    const { dateTime, location } = useAppStore.getState();
    const m = modelRef.current;
    if (!m || m.date !== dateTime || m.location !== location) {
      modelRef.current = buildModel(dateTime, location);
    }
    return modelRef.current!;
  }, []);

  // ─── 描画 ────────────────────────────────────────────
  const draw = useCallback((now: number, reduceMotion: boolean) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { w, h, dpr } = sizeRef.current;
    if (w === 0 || h === 0) return;

    const state = useAppStore.getState();
    const { centerAz, centerAlt, fov, skySettings, selectedBody, lang } = state;
    const model = getModel();
    const selectedId = selectedBody?.id;
    const hoverId = hoverRef.current;
    const pxPerDeg = h / fov;
    const proj = (alt: number, az: number) => projectHorizontal(alt, az, w, h, centerAz, centerAlt, fov);
    const hits: Hit[] = [];
    const labels: LabelBox[] = [];

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'alphabetic';

    // 文字を読みやすくする影付きラベル
    const label = (text: string, x: number, y: number, opts: { color: string; size?: number; weight?: string; align?: CanvasTextAlign }) => {
      ctx.font = `${opts.weight ?? '500'} ${opts.size ?? 11}px ${FONT}`;
      ctx.textAlign = opts.align ?? 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = opts.color;
      ctx.fillText(text, x, y);
      ctx.shadowBlur = 0;
      return ctx.measureText(text).width;
    };

    // ── 背景（空のグラデーション） ──
    const horizonY = proj(0, centerAz).y;
    const zenithY = proj(90, centerAz).y;
    const [top, bottom, glow] = SKY_COLORS[model.skyState];
    const sky = ctx.createLinearGradient(0, Math.min(zenithY, horizonY - 1), 0, horizonY);
    sky.addColorStop(0, top);
    sky.addColorStop(1, bottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const glowGrad = ctx.createLinearGradient(0, horizonY - h * 0.3, 0, horizonY);
    glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    glowGrad.addColorStop(1, glow);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, horizonY - h * 0.3, w, h * 0.3);

    if (skySettings.backgroundBrightness > 0) {
      ctx.fillStyle = `rgba(80, 100, 170, ${skySettings.backgroundBrightness * 0.4})`;
      ctx.fillRect(0, 0, w, h);
    }

    // ── 天の川 ──
    const mwAlpha = MILKY_WAY_ALPHA[model.skyState] * (1 - skySettings.backgroundBrightness * 0.7);
    if (skySettings.showMilkyWay && mwAlpha > 0) {
      ctx.globalCompositeOperation = 'lighter';
      const glow = getGlowSprite();
      const wide = pxPerDeg * 12;
      const core = pxPerDeg * 5.5;
      for (const p of model.milkyWay) {
        if (p.alt < -10) continue;
        const { x, y } = proj(p.alt, p.az);
        if (x < -wide || x > w + wide || y < -wide || y > h + wide) continue;
        for (const [radius, a] of [[wide, 0.035], [core, 0.045]] as const) {
          ctx.globalAlpha = a * p.intensity * mwAlpha;
          ctx.drawImage(glow, x - radius, y - radius, radius * 2, radius * 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // ── グリッド（高度15°・方位30°ごと） ──
    if (skySettings.showGrid) {
      ctx.strokeStyle = 'rgba(140, 165, 255, 0.14)';
      ctx.lineWidth = 1;
      for (let alt = 0; alt <= 90; alt += 15) {
        const { y } = proj(alt, centerAz);
        if (y < 0 || y > h) continue;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        if (alt > 0) label(`${alt}°`, 8, y - 4, { color: 'rgba(170, 190, 255, 0.55)', size: 10 });
      }
      const y0 = Math.max(0, proj(90, centerAz).y);
      const y1 = Math.min(h, proj(-10, centerAz).y);
      for (let az = 0; az < 360; az += 30) {
        const p = proj(0, az);
        if (!p.inView && (p.x < 0 || p.x > w)) continue;
        ctx.beginPath();
        ctx.moveTo(p.x, y0);
        ctx.lineTo(p.x, y1);
        ctx.stroke();
      }
    }

    // ── 星座線と星座名 ──
    const selectedConstellation = selectedBody?.type === 'constellation' ? constellationById.get(selectedBody.id) : undefined;
    const highlightStars = new Set(selectedConstellation?.mainStars ?? []);
    for (const constellation of constellations) {
      const isSelected = selectedId === constellation.id;
      if (skySettings.showConstellationLines || isSelected) {
        ctx.strokeStyle = isSelected ? 'rgba(246, 200, 112, 0.9)' : 'rgba(140, 165, 255, 0.32)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.lineCap = 'round';
        if (isSelected) {
          ctx.shadowColor = 'rgba(246, 200, 112, 0.7)';
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        for (const [id1, id2] of constellation.lines) {
          const s1 = model.starPos.get(id1);
          const s2 = model.starPos.get(id2);
          if (!s1 || !s2 || (s1.alt < -2 && s2.alt < -2)) continue;
          const p1 = proj(s1.alt, s1.az);
          const p2 = proj(s2.alt, s2.az);
          if (!p1.inView && !p2.inView) continue;
          if (Math.abs(p1.x - p2.x) > w * 0.75) continue; // 方位の折り返しをまたぐ線は描かない
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      if (skySettings.showConstellationNames || isSelected) {
        let sumX = 0, sumY = 0, count = 0;
        for (const sid of constellation.mainStars) {
          const s = model.starPos.get(sid);
          if (!s || s.alt < -2) continue;
          const p = proj(s.alt, s.az);
          if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) {
            sumX += p.x;
            sumY += p.y;
            count++;
          }
        }
        if (count > 0) {
          const name = localizedName(constellation.nameJa, constellation.nameEn, lang);
          const x = sumX / count;
          const y = sumY / count - 16;
          const width = label(name, x, y, {
            color: isSelected ? ACCENT : hoverId === constellation.id ? 'rgba(220, 228, 255, 0.95)' : 'rgba(170, 190, 255, 0.62)',
            size: isSelected ? 14 : 12,
            weight: isSelected ? '700' : '500',
            align: 'center',
          });
          labels.push({ id: constellation.id, x0: x - width / 2 - 6, y0: y - 14, x1: x + width / 2 + 6, y1: y + 6 });
        }
      }
    }

    // ── 恒星 ──
    const secs = now / 1000;
    for (const { star, alt, az, phase } of model.stars) {
      if (alt < -2) continue;
      const p = proj(alt, az);
      if (!p.inView) continue;
      const isSelected = selectedId === star.id;
      const isHover = hoverId === star.id;
      const size = Math.max(1.2, (3.5 - star.mag) * 1.35);
      const twinkle = reduceMotion ? 1 : 0.8 + 0.2 * Math.sin(secs * (1.3 + (phase % 1.2)) + phase);

      // グロー
      const glowSize = size * (isHover ? 4.5 : 3.5);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      g.addColorStop(0, star.color + 'aa');
      g.addColorStop(1, star.color + '00');
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = g;
      ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

      // 星本体（中心ほど白く）
      const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.55, star.color);
      core.addColorStop(1, star.color + '00');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 1.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isSelected) drawPulse(ctx, p.x, p.y, size + 7, ACCENT, now, reduceMotion);
      else if (isHover) drawRing(ctx, p.x, p.y, size + 6, 'rgba(220, 228, 255, 0.7)');

      hits.push({ id: star.id, x: p.x, y: p.y, r: 20 });

      const showName = (skySettings.showStarNames && star.mag < 1.5) || isSelected || isHover || highlightStars.has(star.id);
      if (showName) {
        label(localizedName(star.nameJa, star.nameEn, lang), p.x + size + 5, p.y + 4, {
          color: isSelected ? '#ffffff' : isHover ? 'rgba(240, 244, 255, 0.95)' : 'rgba(210, 220, 255, 0.78)',
          size: isSelected ? 13 : 11,
          weight: isSelected ? '700' : '500',
        });
      }
    }

    // ── 惑星 ──
    for (const { planet, alt, az, mag } of model.planets) {
      if (alt < -2) continue;
      const p = proj(alt, az);
      if (!p.inView) continue;
      const isSelected = selectedId === planet.id;
      const isHover = hoverId === planet.id;
      const size = Math.max(3, (2 - mag) * 1.5);

      const glowSize = size * 4;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      g.addColorStop(0, planet.color + 'cc');
      g.addColorStop(1, planet.color + '00');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();

      // 土星には環を添える
      if (planet.id === 'saturn') {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, size * 2.1, size * 0.7, -0.35, 0, Math.PI * 2);
        ctx.strokeStyle = planet.color + 'bb';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      if (isSelected) drawPulse(ctx, p.x, p.y, size + 9, planet.color, now, reduceMotion);
      else if (isHover) drawRing(ctx, p.x, p.y, size + 7, 'rgba(220, 228, 255, 0.7)');

      hits.push({ id: planet.id, x: p.x, y: p.y, r: 25 });

      if (skySettings.showPlanetNames || isSelected || isHover) {
        label(`${textSymbol(planet.symbol)} ${localizedName(planet.nameJa, planet.nameEn, lang)}`, p.x + size + 6, p.y + 4, {
          color: isSelected ? '#ffffff' : planet.color,
          size: isSelected ? 13 : 12,
          weight: isSelected ? '700' : '600',
        });
      }
    }

    // ── 月 ──
    if (model.moon.alt > -2) {
      const p = proj(model.moon.alt, model.moon.az);
      if (p.inView) {
        const size = 13;
        const glowSize = size * 3.2;
        const g = ctx.createRadialGradient(p.x, p.y, size * 0.8, p.x, p.y, glowSize);
        g.addColorStop(0, 'rgba(255, 246, 214, 0.3)');
        g.addColorStop(1, 'rgba(255, 246, 214, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 46, 74, 0.95)';
        ctx.fill();
        ctx.fillStyle = '#fff3c9';
        ctx.fill(new Path2D(moonLitPath(model.moon.phase, p.x, p.y, size)));

        if (selectedId === 'moon') drawPulse(ctx, p.x, p.y, size + 8, '#fff3c9', now, reduceMotion);
        else if (hoverId === 'moon') drawRing(ctx, p.x, p.y, size + 6, 'rgba(255, 246, 214, 0.7)');
        hits.push({ id: 'moon', x: p.x, y: p.y, r: 24 });

        label(`${textSymbol('☽')} ${getMoonPhaseName(model.moon.phase, lang)}`, p.x + size + 6, p.y + 4, {
          color: 'rgba(255, 246, 214, 0.9)',
          size: 12,
          weight: '600',
        });
      }
    }

    // ── 太陽 ──
    if (model.sun.alt > -2) {
      const p = proj(model.sun.alt, model.sun.az);
      if (p.inView) {
        const size = 15;
        const glowSize = size * 5;
        const g = ctx.createRadialGradient(p.x, p.y, size * 0.6, p.x, p.y, glowSize);
        g.addColorStop(0, 'rgba(255, 220, 120, 0.55)');
        g.addColorStop(1, 'rgba(255, 220, 120, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#fff1b8';
        ctx.fill();
        if (selectedId === 'sun') drawPulse(ctx, p.x, p.y, size + 9, '#ffd76a', now, reduceMotion);
        else if (hoverId === 'sun') drawRing(ctx, p.x, p.y, size + 7, 'rgba(255, 230, 160, 0.8)');
        hits.push({ id: 'sun', x: p.x, y: p.y, r: 26 });
        const sun = specialBodies.find((b) => b.id === 'sun')!;
        label(`${textSymbol(sun.symbol)} ${localizedName(sun.nameJa, sun.nameEn, lang)}`, p.x + size + 6, p.y + 4, {
          color: '#ffe7a3',
          size: 12,
          weight: '600',
        });
      }
    }

    // ── 地面と地平線 ──
    if (skySettings.showHorizon && horizonY < h) {
      const yTop = Math.max(0, horizonY);
      const isLight = model.skyState === 'day' || model.skyState === 'civil_twilight';
      const ground = ctx.createLinearGradient(0, yTop, 0, h);
      ground.addColorStop(0, isLight ? 'rgba(38, 58, 56, 0.9)' : 'rgba(10, 16, 28, 0.88)');
      ground.addColorStop(1, isLight ? 'rgba(22, 34, 34, 0.97)' : 'rgba(4, 7, 14, 0.97)');
      ctx.fillStyle = ground;
      ctx.fillRect(0, yTop, w, h - yTop);

      if (horizonY >= 0) {
        ctx.strokeStyle = isLight ? 'rgba(220, 240, 255, 0.45)' : 'rgba(150, 175, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(150, 175, 255, 0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(w, horizonY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // ── 方位 ──
    const directions = [
      { az: 0, key: 'dir.n' as const }, { az: 45, key: 'dir.ne' as const },
      { az: 90, key: 'dir.e' as const }, { az: 135, key: 'dir.se' as const },
      { az: 180, key: 'dir.s' as const }, { az: 225, key: 'dir.sw' as const },
      { az: 270, key: 'dir.w' as const }, { az: 315, key: 'dir.nw' as const },
    ];
    for (const dir of directions) {
      const { x } = proj(0, dir.az);
      if (x < 24 || x > w - 24) continue;
      const isMain = dir.az % 90 === 0;
      const y = Math.min(Math.max(horizonY + 26, 30), h - 14);
      if (isMain) {
        ctx.beginPath();
        ctx.arc(x, y - 5, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(246, 200, 112, 0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(246, 200, 112, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      label(t(dir.key, lang), x, y, {
        color: isMain ? ACCENT : 'rgba(190, 205, 255, 0.6)',
        size: isMain ? 14 : 11,
        weight: isMain ? '700' : '500',
        align: 'center',
      });
    }

    hitsRef.current = hits;
    labelsRef.current = labels;
  }, [getModel]);

  // ─── キャンバスサイズの追従 ─────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      dirtyRef.current = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ─── 描画ループ ───────────────────────────────────────
  useEffect(() => {
    let frame = 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const markDirty = () => { dirtyRef.current = true; };
    const unsubscribe = useAppStore.subscribe(markDirty);
    media.addEventListener('change', markDirty);
    const render = (now: number) => {
      // またたきや脈打つリングがあるときは毎フレーム、ないときは変化時のみ描画
      if (!media.matches || dirtyRef.current) {
        dirtyRef.current = false;
        draw(now, media.matches);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
      media.removeEventListener('change', markDirty);
    };
  }, [draw]);

  // ─── ホイールでズーム（passive: false で登録） ───────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { fov, setFov } = useAppStore.getState();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      setFov(fov * Math.exp(Math.max(-100, Math.min(100, delta)) * 0.0015));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ─── 当たり判定 ──────────────────────────────────────
  const hitTest = useCallback((x: number, y: number): string | null => {
    let best: { id: string; d: number } | null = null;
    for (const hit of hitsRef.current) {
      const d = Math.hypot(x - hit.x, y - hit.y);
      if (d < hit.r && (!best || d < best.d)) best = { id: hit.id, d };
    }
    if (best) return best.id;
    const box = labelsRef.current.find((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
    return box?.id ?? null;
  }, []);

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // ─── ポインター操作（ドラッグ・ピンチ・ホバー） ──────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    useAppStore.getState().cancelFly();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (pointers.current.size === 1) {
      g.startX = e.clientX;
      g.startY = e.clientY;
      g.moved = false;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      g.pinchFov = useAppStore.getState().fov;
      g.moved = true;
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) {
      // ホバー（マウスのみ）
      if (e.pointerType === 'mouse') {
        const { x, y } = localPoint(e);
        const id = hitTest(x, y);
        if (id !== hoverRef.current) dirtyRef.current = true;
        hoverRef.current = id;
        e.currentTarget.style.cursor = id ? 'pointer' : 'grab';
      }
      return;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const state = useAppStore.getState();

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchDist > 0) state.setFov(g.pinchFov * (g.pinchDist / dist));
      return;
    }

    if (!g.moved && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > 4) {
      g.moved = true;
      e.currentTarget.style.cursor = 'grabbing';
    }
    if (!g.moved) return;
    // 指の下の空がそのままついてくる感度
    const degPerPx = state.fov / sizeRef.current.h;
    state.setCenterAz(state.centerAz - (e.clientX - prev.x) * degPerPx);
    state.setCenterAlt(state.centerAlt + (e.clientY - prev.y) * degPerPx);
  }, [hitTest]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      suppressClick.current = gesture.current.moved;
      e.currentTarget.style.cursor = hoverRef.current ? 'pointer' : 'grab';
    } else {
      // ピンチから片手に戻ったら、残った指でドラッグを続ける
      gesture.current.pinchDist = 0;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (hoverRef.current) dirtyRef.current = true;
    hoverRef.current = null;
  }, []);

  // クリックで天体選択
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const { x, y } = localPoint(e);
    const id = hitTest(x, y);
    if (!id) return;
    const { dateTime, location, setSelectedBody } = useAppStore.getState();
    const body = bodyById(id, dateTime, location);
    if (body) setSelectedBody(body);
  }, [hitTest]);

  // キーボード操作
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const s = useAppStore.getState();
    const step = s.fov * 0.06;
    switch (e.key) {
      case 'ArrowLeft': s.cancelFly(); s.setCenterAz(s.centerAz - step); break;
      case 'ArrowRight': s.cancelFly(); s.setCenterAz(s.centerAz + step); break;
      case 'ArrowUp': s.cancelFly(); s.setCenterAlt(s.centerAlt + step); break;
      case 'ArrowDown': s.cancelFly(); s.setCenterAlt(s.centerAlt - step); break;
      case '+': case '=': s.setFov(s.fov * 0.9); break;
      case '-': case '_': s.setFov(s.fov / 0.9); break;
      case 'Escape': s.setSelectedBody(null); break;
      default: return;
    }
    e.preventDefault();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      role="application"
      aria-label={t('canvas.label', lang)}
      className="block w-full h-full cursor-grab touch-none select-none focus-visible:-outline-offset-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}

// 天の川用のぼかし円。毎フレームのグラデーション生成を避けるため一度だけ作って使い回す
let glowSprite: HTMLCanvasElement | null = null;
function getGlowSprite(): HTMLCanvasElement {
  if (glowSprite) return glowSprite;
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(190, 200, 255, 1)');
  grad.addColorStop(1, 'rgba(190, 200, 255, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  glowSprite = c;
  return c;
}

// 選択中の天体を示す脈打つリング
function drawPulse(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, now: number, reduceMotion: boolean) {
  const k = reduceMotion ? 0 : (now % 1800) / 1800;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (!reduceMotion) {
    ctx.globalAlpha = 0.6 * (1 - k);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r + k * 18, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

