import type { Star } from '../types/celestial';

export const stars: Star[] = [
  // オリオン座
  { id: 'betelgeuse', nameJa: 'ベテルギウス', nameEn: 'Betelgeuse', constellation: 'orion', ra: 5.919, dec: 7.407, mag: 0.42, color: '#ffcc6f', description: 'オリオン座の左肩に輝く赤色超巨星。冬の大三角の一角。', descriptionEn: 'A red supergiant at Orion\'s left shoulder. Part of the Winter Triangle.' },
  { id: 'rigel', nameJa: 'リゲル', nameEn: 'Rigel', constellation: 'orion', ra: 5.242, dec: -8.202, mag: 0.13, color: '#aabfff', description: 'オリオン座の右足に輝く青白い超巨星。', descriptionEn: 'A blue-white supergiant at Orion\'s right foot.' },
  { id: 'bellatrix', nameJa: 'ベラトリクス', nameEn: 'Bellatrix', constellation: 'orion', ra: 5.419, dec: 6.350, mag: 1.64, color: '#cad7ff', description: 'オリオン座の右肩に位置する。', descriptionEn: 'Located at Orion\'s right shoulder.' },
  { id: 'saiph', nameJa: 'サイフ', nameEn: 'Saiph', constellation: 'orion', ra: 5.796, dec: -9.670, mag: 2.06, color: '#aabfff', description: 'オリオン座の左足に位置する。', descriptionEn: 'Located at Orion\'s left foot.' },
  { id: 'alnitak', nameJa: 'アルニタク', nameEn: 'Alnitak', constellation: 'orion', ra: 5.679, dec: -1.943, mag: 1.77, color: '#aabfff', description: 'オリオンの三つ星の左端。', descriptionEn: 'The leftmost star of Orion\'s Belt.' },
  { id: 'alnilam', nameJa: 'アルニラム', nameEn: 'Alnilam', constellation: 'orion', ra: 5.604, dec: -1.202, mag: 1.69, color: '#aabfff', description: 'オリオンの三つ星の中央。', descriptionEn: 'The central star of Orion\'s Belt.' },
  { id: 'mintaka', nameJa: 'ミンタカ', nameEn: 'Mintaka', constellation: 'orion', ra: 5.533, dec: -0.299, mag: 2.23, color: '#aabfff', description: 'オリオンの三つ星の右端。', descriptionEn: 'The rightmost star of Orion\'s Belt.' },

  // おうし座
  { id: 'aldebaran', nameJa: 'アルデバラン', nameEn: 'Aldebaran', constellation: 'taurus', ra: 4.599, dec: 16.509, mag: 0.86, color: '#ffcc6f', description: 'おうし座の赤い目。冬のダイヤモンドの一角。', descriptionEn: 'The red eye of Taurus. Part of the Winter Hexagon.' },
  { id: 'elnath', nameJa: 'エルナト', nameEn: 'Elnath', constellation: 'taurus', ra: 5.438, dec: 28.608, mag: 1.65, color: '#cad7ff', description: 'おうし座の角の先。', descriptionEn: 'The tip of the Bull\'s horn in Taurus.' },

  // ふたご座
  { id: 'pollux', nameJa: 'ポルックス', nameEn: 'Pollux', constellation: 'gemini', ra: 7.755, dec: 28.026, mag: 1.14, color: '#ffd2a1', description: 'ふたご座の弟の星。冬のダイヤモンドの一角。', descriptionEn: 'The star of the younger twin in Gemini. Part of the Winter Hexagon.' },
  { id: 'castor', nameJa: 'カストル', nameEn: 'Castor', constellation: 'gemini', ra: 7.577, dec: 31.888, mag: 1.58, color: '#cad7ff', description: 'ふたご座の兄の星。実は六連星。', descriptionEn: 'The star of the elder twin in Gemini. Actually a sextuple star system.' },

  // しし座
  { id: 'regulus', nameJa: 'レグルス', nameEn: 'Regulus', constellation: 'leo', ra: 10.140, dec: 11.967, mag: 1.35, color: '#cad7ff', description: 'しし座の心臓。春の大三角の近く。', descriptionEn: 'The heart of Leo. Located near the Spring Triangle.' },
  { id: 'denebola', nameJa: 'デネボラ', nameEn: 'Denebola', constellation: 'leo', ra: 11.818, dec: 14.572, mag: 2.14, color: '#f8f7ff', description: 'しし座の尾。春の大三角の一角。', descriptionEn: 'The tail of Leo. Part of the Spring Triangle.' },

  // さそり座
  { id: 'antares', nameJa: 'アンタレス', nameEn: 'Antares', constellation: 'scorpius', ra: 16.490, dec: -26.432, mag: 0.96, color: '#ffcc6f', description: '「火星に対抗するもの」の意。赤色超巨星。', descriptionEn: 'Name means "rival of Mars." A red supergiant.' },
  { id: 'shaula', nameJa: 'シャウラ', nameEn: 'Shaula', constellation: 'scorpius', ra: 17.560, dec: -37.104, mag: 1.63, color: '#cad7ff', description: 'さそり座の尾の先端。', descriptionEn: 'The tip of the Scorpion\'s tail.' },

  // いて座
  { id: 'kaus_australis', nameJa: 'カウス・アウストラリス', nameEn: 'Kaus Australis', constellation: 'sagittarius', ra: 18.403, dec: -34.385, mag: 1.85, color: '#cad7ff', description: 'いて座で最も明るい星。弓の南端。', descriptionEn: 'The brightest star in Sagittarius. The southern end of the Archer\'s bow.' },
  { id: 'nunki', nameJa: 'ヌンキ', nameEn: 'Nunki', constellation: 'sagittarius', ra: 18.921, dec: -26.297, mag: 2.02, color: '#aabfff', description: 'いて座の矢の先。古代バビロニア起源の名前。', descriptionEn: 'The tip of the Archer\'s arrow. Name of ancient Babylonian origin.' },

  // はくちょう座
  { id: 'deneb', nameJa: 'デネブ', nameEn: 'Deneb', constellation: 'cygnus', ra: 20.690, dec: 45.280, mag: 1.25, color: '#f8f7ff', description: '夏の大三角の一角。超巨星で非常に遠距離にある。', descriptionEn: 'Part of the Summer Triangle. A distant supergiant of exceptional luminosity.' },
  { id: 'sadr', nameJa: 'サドル', nameEn: 'Sadr', constellation: 'cygnus', ra: 20.370, dec: 40.257, mag: 2.20, color: '#ffd2a1', description: 'はくちょう座の胸にあたる。', descriptionEn: 'Located at the breast of the Swan in Cygnus.' },
  { id: 'albireo', nameJa: 'アルビレオ', nameEn: 'Albireo', constellation: 'cygnus', ra: 19.512, dec: 27.960, mag: 3.08, color: '#ffd2a1', description: 'くちばしの星。望遠鏡で見ると美しい二重星。', descriptionEn: 'The beak star of Cygnus. A beautiful double star through a telescope.' },

  // こと座
  { id: 'vega', nameJa: 'ベガ', nameEn: 'Vega', constellation: 'lyra', ra: 18.616, dec: 38.784, mag: 0.03, color: '#f8f7ff', description: '夏の大三角の一角。織姫星。全天で5番目に明るい恒星。', descriptionEn: 'Part of the Summer Triangle. The Weaver Star. The 5th brightest star in the sky.' },

  // カシオペヤ座
  { id: 'schedar', nameJa: 'シェダル', nameEn: 'Schedar', constellation: 'cassiopeia', ra: 0.675, dec: 56.537, mag: 2.23, color: '#ffd2a1', description: 'カシオペヤ座で最も明るい星。', descriptionEn: 'The brightest star in Cassiopeia.' },
  { id: 'caph', nameJa: 'カフ', nameEn: 'Caph', constellation: 'cassiopeia', ra: 0.153, dec: 59.150, mag: 2.27, color: '#f8f7ff', description: 'カシオペヤ座のW字の一端。', descriptionEn: 'One end of Cassiopeia\'s W-shape.' },

  // おおぐま座
  { id: 'dubhe', nameJa: 'ドゥーベ', nameEn: 'Dubhe', constellation: 'ursa_major', ra: 11.062, dec: 61.751, mag: 1.79, color: '#ffd2a1', description: '北斗七星の先端。北極星を見つける目印。', descriptionEn: 'The tip of the Big Dipper\'s bowl. A pointer star to Polaris.' },
  { id: 'merak', nameJa: 'メラク', nameEn: 'Merak', constellation: 'ursa_major', ra: 11.031, dec: 56.382, mag: 2.37, color: '#f8f7ff', description: '北斗七星の一つ。ドゥーベと共に北極星への指極星。', descriptionEn: 'A Big Dipper star. Together with Dubhe, a pointer star to Polaris.' },
  { id: 'alioth', nameJa: 'アリオト', nameEn: 'Alioth', constellation: 'ursa_major', ra: 12.900, dec: 55.960, mag: 1.77, color: '#f8f7ff', description: 'おおぐま座で最も明るい星。', descriptionEn: 'The brightest star in Ursa Major.' },
  { id: 'mizar', nameJa: 'ミザール', nameEn: 'Mizar', constellation: 'ursa_major', ra: 13.399, dec: 54.925, mag: 2.27, color: '#f8f7ff', description: '北斗七星の柄杓の柄。肉眼二重星として有名。', descriptionEn: 'In the handle of the Big Dipper. Famous naked-eye double star with Alcor.' },

  // わし座
  { id: 'altair', nameJa: 'アルタイル', nameEn: 'Altair', constellation: 'aquila', ra: 19.846, dec: 8.868, mag: 0.77, color: '#f8f7ff', description: '夏の大三角の一角。彦星。高速自転する。', descriptionEn: 'Part of the Summer Triangle. The Cowherd Star. A rapid rotator.' },

  // おとめ座
  { id: 'spica', nameJa: 'スピカ', nameEn: 'Spica', constellation: 'virgo', ra: 13.420, dec: -11.161, mag: 0.97, color: '#aabfff', description: '春の大三角の一角。真珠星とも呼ばれる。', descriptionEn: 'Part of the Spring Triangle. Also known as the Pearl Star.' },

  // その他の有名な恒星
  { id: 'sirius', nameJa: 'シリウス', nameEn: 'Sirius', constellation: 'canis_major', ra: 6.752, dec: -16.716, mag: -1.46, color: '#f8f7ff', description: '全天で最も明るい恒星。冬の大三角の一角。', descriptionEn: 'The brightest star in the night sky. Part of the Winter Triangle.' },
  { id: 'arcturus', nameJa: 'アルクトゥルス', nameEn: 'Arcturus', constellation: 'bootes', ra: 14.261, dec: 19.182, mag: -0.05, color: '#ffd2a1', description: '春の大三角の一角。うしかい座の主星。', descriptionEn: 'Part of the Spring Triangle. The primary star of Bootes.' },
  { id: 'procyon', nameJa: 'プロキオン', nameEn: 'Procyon', constellation: 'canis_minor', ra: 7.655, dec: 5.225, mag: 0.34, color: '#ffd2a1', description: '冬の大三角の一角。こいぬ座の主星。', descriptionEn: 'Part of the Winter Triangle. The primary star of Canis Minor.' },
  { id: 'polaris', nameJa: 'ポラリス', nameEn: 'Polaris', constellation: 'ursa_minor', ra: 2.530, dec: 89.264, mag: 1.98, color: '#ffd2a1', description: '北極星。こぐま座の尾の先端。', descriptionEn: 'The North Star. At the tip of the tail of Ursa Minor.' },
  { id: 'capella', nameJa: 'カペラ', nameEn: 'Capella', constellation: 'auriga', ra: 5.278, dec: 45.998, mag: 0.08, color: '#ffd2a1', description: 'ぎょしゃ座の主星。冬のダイヤモンドの一角。', descriptionEn: 'The primary star of Auriga. Part of the Winter Hexagon.' },
  { id: 'fomalhaut', nameJa: 'フォーマルハウト', nameEn: 'Fomalhaut', constellation: 'piscis_austrinus', ra: 22.961, dec: -29.622, mag: 1.16, color: '#f8f7ff', description: '秋のひとつ星。みなみのうお座の主星。', descriptionEn: 'The solitary star of autumn. The primary star of Piscis Austrinus.' },
  { id: 'achernar', nameJa: 'アケルナル', nameEn: 'Achernar', constellation: 'eridanus', ra: 1.629, dec: -57.237, mag: 0.46, color: '#aabfff', description: 'エリダヌス座の南端。川の果ての星。', descriptionEn: 'The southern end of Eridanus. The star at the end of the river.' },
  { id: 'canopus', nameJa: 'カノープス', nameEn: 'Canopus', constellation: 'carina', ra: 6.399, dec: -52.696, mag: -0.74, color: '#f8f7ff', description: '全天で2番目に明るい恒星。りゅうこつ座の主星。', descriptionEn: 'The 2nd brightest star in the night sky. The primary star of Carina.' },
];
