import { useMemo } from 'react';
import type { Constellation } from '../../types/celestial';
import { starById } from '../../utils/bodies';
import { t, type Lang } from '../../i18n/translations';
import { moonLitPath } from '../../utils/moonPath';

// ─── 月の満ち欠け ─────────────────────────────────────

export function MoonPhaseIcon({ phase, size = 40, className }: { phase: number; size?: number; className?: string }) {
  const r = 10;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#fff6d6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#fff6d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#moon-glow)" />
      <circle cx="12" cy="12" r={r} fill="#2a2f4a" stroke="rgb(255 246 214 / 0.25)" strokeWidth="0.5" />
      <path d={moonLitPath(phase, 12, 12, r)} fill="#fff3c9" />
    </svg>
  );
}

// ─── 星座のシルエット ───────────────────────────────────

export function ConstellationThumb({
  constellation,
  size = 48,
  className,
  highlight = false,
}: {
  constellation: Constellation;
  size?: number;
  className?: string;
  highlight?: boolean;
}) {
  const shape = useMemo(() => {
    const ids = new Set<string>([...constellation.mainStars, ...constellation.lines.flat()]);
    const list = [...ids].map((id) => starById.get(id)).filter((s) => !!s);
    if (list.length === 0) return null;
    const ra0 = list[0]!.ra;
    const dec0 = list.reduce((sum, s) => sum + s!.dec, 0) / list.length;
    const cosDec = Math.cos((dec0 * Math.PI) / 180);
    // 赤経が0時をまたぐ場合に備えて基準星からの差で計算（東が左になるよう反転）
    const raw = list.map((s) => {
      let dRa = s!.ra - ra0;
      if (dRa > 12) dRa -= 24;
      if (dRa < -12) dRa += 24;
      return { id: s!.id, x: -dRa * 15 * cosDec, y: -s!.dec, mag: s!.mag };
    });
    const xs = raw.map((p) => p.x);
    const ys = raw.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const span = Math.max(maxX - minX, maxY - minY, 1);
    const scale = 22 / span;
    const offX = 12 - ((minX + maxX) / 2) * scale;
    const offY = 12 - ((minY + maxY) / 2) * scale;
    const pts = new Map(raw.map((p) => [p.id, { x: p.x * scale + offX, y: p.y * scale + offY, mag: p.mag }]));
    return { pts };
  }, [constellation]);

  if (!shape) return null;
  const stroke = highlight ? 'var(--accent)' : 'var(--nebula)';
  return (
    <svg width={size} height={size} viewBox="-3 -3 30 30" aria-hidden="true" className={className}>
      {constellation.lines.map(([a, b]) => {
        const p1 = shape.pts.get(a);
        const p2 = shape.pts.get(b);
        if (!p1 || !p2) return null;
        return (
          <line key={`${a}-${b}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={stroke} strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
        );
      })}
      {[...shape.pts.entries()].map(([id, p]) => (
        <circle key={id} cx={p.x} cy={p.y} r={Math.max(0.9, (3 - p.mag) * 0.55)} fill={highlight ? 'var(--accent)' : 'var(--ink)'} />
      ))}
    </svg>
  );
}

// ─── 空のどこにあるか（全天図） ──────────────────────────

// 中心が真上（天頂）、外周が地平線の円で、天体の位置を示す
export function SkyDome({ alt, az, lang, size = 104, color = 'var(--accent)' }: { alt: number; az: number; lang: Lang; size?: number; color?: string }) {
  const R = 40;
  const below = alt < 0;
  const radius = below ? R + 6 : ((90 - alt) / 90) * R;
  const rad = (az * Math.PI) / 180;
  // 上を北、右を東として描く（地図と同じ向き）
  const x = 50 + Math.sin(rad) * radius;
  const y = 50 - Math.cos(rad) * radius;
  const labels: [string, number, number][] = [
    [t('dir.n', lang), 50, 5.5],
    [t('dir.e', lang), 95, 51.5],
    [t('dir.s', lang), 50, 98],
    [t('dir.w', lang), 5, 51.5],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r={R} fill="var(--nebula-soft)" stroke="var(--line)" />
      <circle cx="50" cy="50" r={R * (2 / 3)} fill="none" stroke="var(--line)" strokeDasharray="2 3" />
      <circle cx="50" cy="50" r={R / 3} fill="none" stroke="var(--line)" strokeDasharray="2 3" />
      <path d="M50 10v80M10 50h80" stroke="var(--line)" />
      <circle cx="50" cy="50" r="1.4" fill="var(--faint)" />
      {labels.map(([label, lx, ly]) => (
        <text key={label} x={lx} y={ly} fontSize="8.5" textAnchor="middle" fill="var(--muted)" fontWeight="600">
          {label}
        </text>
      ))}
      <line x1="50" y1="50" x2={x} y2={y} stroke={color} strokeOpacity={below ? 0.3 : 0.6} strokeWidth="1.2" strokeDasharray={below ? '2 2' : undefined} />
      <circle cx={x} cy={y} r="7" fill={color} opacity={below ? 0.12 : 0.22} />
      <circle cx={x} cy={y} r="3.6" fill={color} opacity={below ? 0.5 : 1} />
    </svg>
  );
}

// ─── 明るさメーター ─────────────────────────────────────

const MAG_BRIGHT = -5;
const MAG_FAINT = 6;

export function MagnitudeMeter({ mag, color = 'var(--accent)' }: { mag: number; color?: string }) {
  const ratio = Math.min(1, Math.max(0, (MAG_FAINT - mag) / (MAG_FAINT - MAG_BRIGHT)));
  return (
    <div className="relative h-2 rounded-full bg-raised overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(4, ratio * 100)}%`, background: `linear-gradient(90deg, var(--nebula-soft), ${color})` }}
      />
    </div>
  );
}
