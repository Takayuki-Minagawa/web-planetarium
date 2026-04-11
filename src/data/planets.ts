import type { Planet } from '../types/celestial';

export const planets: Planet[] = [
  {
    id: 'mercury',
    nameJa: '水星',
    nameEn: 'Mercury',
    symbol: '☿',
    color: '#b0b0b0',
    description: '太陽に最も近い惑星。太陽の近くでしか見えず、観測が難しい。',
  },
  {
    id: 'venus',
    nameJa: '金星',
    nameEn: 'Venus',
    symbol: '♀',
    color: '#ffffd4',
    description: '明けの明星・宵の明星として知られる。最も明るい惑星。',
  },
  {
    id: 'mars',
    nameJa: '火星',
    nameEn: 'Mars',
    symbol: '♂',
    color: '#ff6b4a',
    description: '赤く見える惑星。約2年周期で地球に接近する。',
  },
  {
    id: 'jupiter',
    nameJa: '木星',
    nameEn: 'Jupiter',
    symbol: '♃',
    color: '#ffd4a0',
    description: '太陽系最大の惑星。明るく見え、4つのガリレオ衛星が有名。',
  },
  {
    id: 'saturn',
    nameJa: '土星',
    nameEn: 'Saturn',
    symbol: '♄',
    color: '#ffe4b5',
    description: '環を持つ惑星として有名。望遠鏡で環が見える。',
  },
];

export const specialBodies = [
  {
    id: 'sun',
    nameJa: '太陽',
    nameEn: 'Sun',
    symbol: '☉',
    color: '#ffd700',
    description: '太陽系の中心の恒星。地球からの距離は約1億5000万km。',
  },
  {
    id: 'moon',
    nameJa: '月',
    nameEn: 'Moon',
    symbol: '☽',
    color: '#fffacd',
    description: '地球の唯一の衛星。約29.5日周期で満ち欠けを繰り返す。',
  },
];
