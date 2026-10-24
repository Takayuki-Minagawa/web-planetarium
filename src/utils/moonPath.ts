// 月の明るい部分の SVG パス（phase: 0=新月, 0.5=満月）。北半球からの見え方
export function moonLitPath(phase: number, cx: number, cy: number, r: number): string {
  const rx = Math.abs(Math.cos(phase * 2 * Math.PI)) * r;
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  if (phase < 0.5) {
    const sweep = phase < 0.25 ? 0 : 1;
    return `M ${top} A ${r} ${r} 0 0 1 ${bottom} A ${rx} ${r} 0 0 ${sweep} ${top} Z`;
  }
  const sweep = phase < 0.75 ? 0 : 1;
  return `M ${top} A ${r} ${r} 0 0 0 ${bottom} A ${rx} ${r} 0 0 ${sweep} ${top} Z`;
}
