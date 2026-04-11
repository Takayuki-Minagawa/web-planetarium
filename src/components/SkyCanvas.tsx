import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { stars } from '../data/stars';
import { constellations } from '../data/constellations';
import {
  projectStar,
  getPlanetPosition,
  getMoonPosition,
  getMoonPhase,
  getSkyState,
  equatorialToHorizontal,
} from '../utils/astronomy';
import { planets } from '../data/planets';
import type { CelestialBody } from '../types/celestial';

export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const {
    location,
    dateTime,
    skySettings,
    centerAz,
    centerAlt,
    fov,
    setCenterAz,
    setCenterAlt,
    setFov,
    setSelectedBody,
  } = useAppStore();

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
    ctx.lineWidth = 0.5;

    // 方位グリッド（30度ごと）
    for (let az = 0; az < 360; az += 30) {
      for (let alt = -10; alt <= 90; alt += 5) {
        const dAz = az - centerAz;
        const dAlt = alt - centerAlt;
        const normalizedDAz = ((dAz + 180) % 360) - 180;
        const halfFov = fov / 2;
        const aspectRatio = w / h;
        const x = w / 2 + (normalizedDAz / (halfFov * aspectRatio)) * (w / 2);
        const y = h / 2 - (dAlt / halfFov) * (h / 2);
        if (x >= 0 && x <= w && y >= 0 && y <= h) {
          ctx.fillStyle = 'rgba(100, 150, 255, 0.15)';
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }
    }

    // 高度グリッド（15度ごと）
    for (let alt = 0; alt <= 90; alt += 15) {
      ctx.beginPath();
      let started = false;
      for (let az = centerAz - fov; az <= centerAz + fov; az += 1) {
        const dAz = az - centerAz;
        const dAlt = alt - centerAlt;
        const normalizedDAz = ((dAz + 180) % 360) - 180;
        const halfFov = fov / 2;
        const aspectRatio = w / h;
        const x = w / 2 + (normalizedDAz / (halfFov * aspectRatio)) * (w / 2);
        const y = h / 2 - (dAlt / halfFov) * (h / 2);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [centerAz, centerAlt, fov]);

  const drawHorizon = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const dAlt = 0 - centerAlt;
    const halfFov = fov / 2;
    const y = h / 2 - (dAlt / halfFov) * (h / 2);

    if (y >= 0 && y <= h) {
      // 地平線下を塗りつぶし
      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, 'rgba(30, 60, 30, 0.3)');
      grad.addColorStop(1, 'rgba(20, 40, 20, 0.6)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, w, h - y);

      // 地平線ライン
      ctx.strokeStyle = 'rgba(100, 200, 100, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [centerAlt, fov]);

  const drawConstellationLines = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const starMap = new Map(stars.map(s => [s.id, s]));
    const selectedBody = useAppStore.getState().selectedBody;

    for (const constellation of constellations) {
      const isSelected = selectedBody?.id === constellation.id;
      ctx.strokeStyle = isSelected ? 'rgba(100, 200, 255, 0.8)' : 'rgba(100, 150, 255, 0.25)';
      ctx.lineWidth = isSelected ? 2 : 1;

      for (const [starId1, starId2] of constellation.lines) {
        const s1 = starMap.get(starId1);
        const s2 = starMap.get(starId2);
        if (!s1 || !s2) continue;

        const p1 = projectStar(s1.ra, s1.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
        const p2 = projectStar(s2.ra, s2.dec, dateTime, location, w, h, centerAz, centerAlt, fov);

        if ((p1.visible || p2.visible) && p1.x >= -w && p1.x <= w * 2 && p2.x >= -w && p2.x <= w * 2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 星座名
      if (skySettings.showConstellationNames) {
        const mainStarIds = constellation.mainStars;
        let sumX = 0, sumY = 0, count = 0;
        for (const sid of mainStarIds) {
          const s = starMap.get(sid);
          if (!s) continue;
          const p = projectStar(s.ra, s.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
          if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) {
            sumX += p.x;
            sumY += p.y;
            count++;
          }
        }
        if (count > 0) {
          ctx.fillStyle = isSelected ? 'rgba(100, 220, 255, 0.9)' : 'rgba(150, 200, 255, 0.5)';
          ctx.font = isSelected ? 'bold 14px sans-serif' : '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(constellation.nameJa, sumX / count, sumY / count - 15);
        }
      }
    }
  }, [dateTime, location, centerAz, centerAlt, fov, skySettings.showConstellationNames]);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const selectedBody = useAppStore.getState().selectedBody;

    for (const star of stars) {
      const p = projectStar(star.ra, star.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
      if (!p.visible || p.x < 0 || p.x > w || p.y < 0 || p.y > h) continue;

      const isSelected = selectedBody?.id === star.id;
      // 等級に応じたサイズ
      const size = Math.max(1, (3.5 - star.mag) * 1.5);

      // グロー効果
      const glowSize = size * 3;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      glow.addColorStop(0, star.color + 'aa');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

      // 星本体
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : star.color;
      ctx.fill();

      // 選択中のハイライト
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 恒星名
      if (skySettings.showStarNames && star.mag < 1.5) {
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(200, 220, 255, 0.7)';
        ctx.font = isSelected ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(star.nameJa, p.x + size + 4, p.y + 4);
      }
    }
  }, [dateTime, location, centerAz, centerAlt, fov, skySettings.showStarNames]);

  const drawPlanets = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const selectedBody = useAppStore.getState().selectedBody;

    for (const planet of planets) {
      const pos = getPlanetPosition(planet.id, dateTime);
      if (!pos) continue;

      const p = projectStar(pos.ra, pos.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
      if (!p.visible || p.x < 0 || p.x > w || p.y < 0 || p.y > h) continue;

      const isSelected = selectedBody?.id === planet.id;
      const size = Math.max(3, (2 - pos.mag) * 1.5);

      // グロー
      const glowSize = size * 4;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      glow.addColorStop(0, planet.color + 'cc');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

      // 惑星本体
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();

      // 選択中
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size + 8, 0, Math.PI * 2);
        ctx.strokeStyle = planet.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 惑星名
      if (skySettings.showPlanetNames) {
        ctx.fillStyle = isSelected ? '#ffffff' : planet.color;
        ctx.font = isSelected ? 'bold 13px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${planet.symbol} ${planet.nameJa}`, p.x + size + 5, p.y + 4);
      }
    }
  }, [dateTime, location, centerAz, centerAlt, fov, skySettings.showPlanetNames]);

  const drawMoon = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const moonPos = getMoonPosition(dateTime);
    const p = projectStar(moonPos.ra, moonPos.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
    if (!p.visible || p.x < 0 || p.x > w || p.y < 0 || p.y > h) return;

    const moonPhase = getMoonPhase(dateTime);
    const size = 12;

    // グロー
    const glowSize = size * 3;
    const glow = ctx.createRadialGradient(p.x, p.y, size, p.x, p.y, glowSize);
    glow.addColorStop(0, 'rgba(255, 250, 205, 0.3)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

    // 月本体
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#fffacd';
    ctx.fill();

    // 月相を表現（影部分）
    const phaseAngle = moonPhase.phase * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, -Math.PI / 2, Math.PI / 2);
    const shadowX = Math.cos(phaseAngle) * size;
    ctx.ellipse(p.x, p.y, Math.abs(shadowX), size, 0, Math.PI / 2, -Math.PI / 2, moonPhase.phase < 0.5);
    ctx.fillStyle = 'rgba(5, 5, 20, 0.85)';
    ctx.fill();

    // 月名
    ctx.fillStyle = 'rgba(255, 250, 200, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`☽ ${moonPhase.phaseName}`, p.x + size + 5, p.y + 4);
  }, [dateTime, location, centerAz, centerAlt, fov]);

  const drawCardinalDirections = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const directions = [
      { az: 0, label: '北' },
      { az: 45, label: '北東' },
      { az: 90, label: '東' },
      { az: 135, label: '南東' },
      { az: 180, label: '南' },
      { az: 225, label: '南西' },
      { az: 270, label: '西' },
      { az: 315, label: '北西' },
    ];

    const halfFov = fov / 2;
    const aspectRatio = w / h;

    for (const dir of directions) {
      const dAz = ((dir.az - centerAz + 180) % 360) - 180;
      const x = w / 2 + (dAz / (halfFov * aspectRatio)) * (w / 2);
      const dAlt = 0 - centerAlt;
      const y = h / 2 - (dAlt / halfFov) * (h / 2);

      if (x >= 20 && x <= w - 20) {
        const isMain = dir.az % 90 === 0;
        ctx.fillStyle = isMain ? 'rgba(100, 200, 100, 0.9)' : 'rgba(100, 200, 100, 0.5)';
        ctx.font = isMain ? 'bold 16px sans-serif' : '12px sans-serif';
        ctx.textAlign = 'center';
        const textY = Math.min(Math.max(y + 25, 30), h - 10);
        ctx.fillText(dir.label, x, textY);
      }
    }
  }, [centerAz, centerAlt, fov]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    // 空の状態で背景色を変える
    const skyState = getSkyState(dateTime, location);
    let bgColor: string;
    switch (skyState) {
      case 'night': bgColor = `rgba(5, 5, 20, ${1 - skySettings.backgroundBrightness * 0.5})`; break;
      case 'astronomical_twilight': bgColor = '#0a0a2e'; break;
      case 'nautical_twilight': bgColor = '#1a1a4e'; break;
      case 'civil_twilight': bgColor = '#2a3a6e'; break;
      case 'day': bgColor = '#4a7ab5'; break;
    }
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // グリッド描画
    if (skySettings.showGrid) {
      drawGrid(ctx, w, h);
    }

    // 地平線
    if (skySettings.showHorizon) {
      drawHorizon(ctx, w, h);
    }

    // 星座線
    if (skySettings.showConstellationLines) {
      drawConstellationLines(ctx, w, h);
    }

    // 恒星描画
    drawStars(ctx, w, h);

    // 惑星描画
    drawPlanets(ctx, w, h);

    // 月描画
    drawMoon(ctx, w, h);

    // 方位表示
    drawCardinalDirections(ctx, w, h);
  }, [dateTime, location, skySettings,
      drawGrid, drawHorizon, drawConstellationLines, drawStars, drawPlanets, drawMoon, drawCardinalDirections]);

  // ドラッグ操作
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    const sensitivity = fov / 800;
    setCenterAz(centerAz - dx * sensitivity);
    setCenterAlt(centerAlt + dy * sensitivity);
  }, [centerAz, centerAlt, fov, setCenterAz, setCenterAlt]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ズーム
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 5 : -5;
    setFov(fov + delta);
  }, [fov, setFov]);

  // クリックで天体選択
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    let closest: { id: string; dist: number; body: CelestialBody } | null = null;

    // 恒星チェック
    for (const star of stars) {
      const p = projectStar(star.ra, star.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
      if (!p.visible || p.x < 0 || p.x > w || p.y < 0 || p.y > h) continue;
      const dist = Math.hypot(clickX - p.x, clickY - p.y);
      if (dist < 20 && (!closest || dist < closest.dist)) {
        const pos = equatorialToHorizontal(star.ra, star.dec, dateTime, location);
        closest = {
          id: star.id,
          dist,
          body: {
            id: star.id,
            nameJa: star.nameJa,
            nameEn: star.nameEn,
            type: 'star' as const,
            ra: star.ra,
            dec: star.dec,
            alt: pos.alt,
            az: pos.az,
            mag: star.mag,
            isVisible: pos.alt > 0,
            description: star.description,
          }
        };
      }
    }

    // 惑星チェック
    for (const planet of planets) {
      const pos = getPlanetPosition(planet.id, dateTime);
      if (!pos) continue;
      const p = projectStar(pos.ra, pos.dec, dateTime, location, w, h, centerAz, centerAlt, fov);
      if (!p.visible || p.x < 0 || p.x > w || p.y < 0 || p.y > h) continue;
      const dist = Math.hypot(clickX - p.x, clickY - p.y);
      const horizPos = equatorialToHorizontal(pos.ra, pos.dec, dateTime, location);
      if (dist < 25 && (!closest || dist < closest.dist)) {
        closest = {
          id: planet.id,
          dist,
          body: {
            id: planet.id,
            nameJa: planet.nameJa,
            nameEn: planet.nameEn,
            type: 'planet' as const,
            ra: pos.ra,
            dec: pos.dec,
            alt: horizPos.alt,
            az: horizPos.az,
            mag: pos.mag,
            isVisible: horizPos.alt > 0,
            description: planet.description,
          }
        };
      }
    }

    if (closest) {
      setSelectedBody(closest.body);
    }
  }, [dateTime, location, centerAz, centerAlt, fov, setSelectedBody]);

  // 描画ループ
  useEffect(() => {
    const render = () => {
      draw();
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onClick={handleClick}
    />
  );
}
