export type Lang = 'ja' | 'en';

const translations = {
  // App
  'app.title': { ja: 'Web Planetarium', en: 'Web Planetarium' },
  'app.subtitle': { ja: '星座・プラネタリウム', en: 'Constellation & Planetarium' },

  // Tabs
  'tab.constellations': { ja: '星座', en: 'Constellations' },
  'tab.stars': { ja: '恒星', en: 'Stars' },
  'tab.planets': { ja: '惑星', en: 'Planets' },
  'tab.visible': { ja: '見える天体', en: 'Visible' },

  // Sidebar
  'sidebar.search': { ja: '天体を検索...', en: 'Search...' },
  'sidebar.sunMoon': { ja: '太陽・月', en: 'Sun & Moon' },
  'sidebar.planets': { ja: '惑星', en: 'Planets' },
  'sidebar.astroInfo': { ja: '天文情報', en: 'Astronomy Info' },
  'sidebar.sunrise': { ja: '日の出', en: 'Sunrise' },
  'sidebar.sunset': { ja: '日の入り', en: 'Sunset' },
  'sidebar.moonrise': { ja: '月の出', en: 'Moonrise' },
  'sidebar.moonset': { ja: '月の入り', en: 'Moonset' },
  'sidebar.moonPhase': { ja: '月相', en: 'Moon Phase' },
  'sidebar.visibleNow': { ja: '現在見える天体', en: 'Visible Now' },
  'sidebar.typeStar': { ja: '恒星', en: 'Star' },
  'sidebar.typePlanet': { ja: '惑星', en: 'Planet' },
  'sidebar.typeMoon': { ja: '月', en: 'Moon' },
  'sidebar.magnitude': { ja: '等', en: 'mag' },
  'sidebar.altitude': { ja: '高度', en: 'Alt' },
  'sidebar.azimuth': { ja: '方位', en: 'Az' },

  // Seasons
  'season.spring': { ja: '春', en: 'Spring' },
  'season.summer': { ja: '夏', en: 'Summer' },
  'season.autumn': { ja: '秋', en: 'Autumn' },
  'season.winter': { ja: '冬', en: 'Winter' },
  'season.all': { ja: '通年', en: 'Year-round' },

  // Control panel
  'control.resetTime': { ja: '今に戻す', en: 'Now' },
  'control.resetView': { ja: '視点リセット', en: 'Reset View' },
  'control.location': { ja: '観測地点', en: 'Location' },
  'control.useCurrentLocation': { ja: '現在地を使用', en: 'Use Current Location' },
  'control.latLng': { ja: '緯度・経度を入力', en: 'Enter Lat / Lng' },
  'control.latitude': { ja: '緯度', en: 'Lat' },
  'control.longitude': { ja: '経度', en: 'Lng' },
  'control.settings': { ja: '表示設定', en: 'Display Settings' },
  'control.constellationLines': { ja: '星座線', en: 'Constellation Lines' },
  'control.constellationNames': { ja: '星座名', en: 'Constellation Names' },
  'control.starNames': { ja: '恒星名', en: 'Star Names' },
  'control.planetNames': { ja: '惑星名', en: 'Planet Names' },
  'control.horizon': { ja: '地平線', en: 'Horizon' },
  'control.grid': { ja: 'グリッド', en: 'Grid' },
  'control.brightness': { ja: '背景の明るさ', en: 'Background Brightness' },

  // Detail panel
  'detail.mythology': { ja: '神話・豆知識', en: 'Mythology & Trivia' },
  'detail.visible': { ja: '現在見える', en: 'Visible Now' },
  'detail.notVisible': { ja: '現在見えない', en: 'Not Visible' },
  'detail.type.constellation': { ja: '星座', en: 'Constellation' },
  'detail.type.star': { ja: '恒星', en: 'Star' },
  'detail.type.planet': { ja: '惑星', en: 'Planet' },
  'detail.type.sun': { ja: '恒星', en: 'Star' },
  'detail.type.moon': { ja: '衛星', en: 'Satellite' },
  'detail.magnitude': { ja: '等級', en: 'Magnitude' },
  'detail.ra': { ja: '赤経', en: 'RA' },
  'detail.dec': { ja: '赤緯', en: 'Dec' },
  'detail.altitude': { ja: '高度', en: 'Altitude' },
  'detail.azimuth': { ja: '方位', en: 'Azimuth' },

  // Cardinal directions
  'dir.n': { ja: '北', en: 'N' },
  'dir.ne': { ja: '北東', en: 'NE' },
  'dir.e': { ja: '東', en: 'E' },
  'dir.se': { ja: '南東', en: 'SE' },
  'dir.s': { ja: '南', en: 'S' },
  'dir.sw': { ja: '南西', en: 'SW' },
  'dir.w': { ja: '西', en: 'W' },
  'dir.nw': { ja: '北西', en: 'NW' },

  // Moon phases
  'moon.new': { ja: '新月', en: 'New Moon' },
  'moon.waxingCrescent': { ja: '三日月', en: 'Waxing Crescent' },
  'moon.firstQuarter': { ja: '上弦の月', en: 'First Quarter' },
  'moon.waxingGibbous': { ja: '十日夜の月', en: 'Waxing Gibbous' },
  'moon.full': { ja: '満月', en: 'Full Moon' },
  'moon.waningGibbous': { ja: '十六夜の月', en: 'Waning Gibbous' },
  'moon.lastQuarter': { ja: '下弦の月', en: 'Last Quarter' },
  'moon.waningCrescent': { ja: '二十六夜の月', en: 'Waning Crescent' },

  // Help
  'help.title': { ja: '使い方', en: 'How to Use' },
  'help.section.basic': { ja: '基本操作', en: 'Basic Controls' },
  'help.section.sidebar': { ja: 'サイドバー', en: 'Sidebar' },
  'help.section.controls': { ja: '設定パネル', en: 'Settings Panel' },
  'help.section.display': { ja: '表示切替', en: 'Display Options' },

  'help.basic.drag': {
    ja: 'ドラッグで視点を移動できます。',
    en: 'Drag to move the viewpoint.',
  },
  'help.basic.scroll': {
    ja: 'マウスホイールまたはピンチ操作で拡大・縮小できます。',
    en: 'Use the mouse wheel or pinch to zoom in/out.',
  },
  'help.basic.click': {
    ja: '星や惑星をクリック（タップ）すると詳細情報が表示されます。',
    en: 'Click or tap a star or planet to view its details.',
  },
  'help.basic.zoom': {
    ja: '右上の +/- ボタンでもズームできます。',
    en: 'You can also zoom with the +/- buttons at the top right.',
  },

  'help.sidebar.list': {
    ja: '星座・恒星・惑星のリストから選択すると、その天体へ視点が移動します。',
    en: 'Select from the constellation, star, or planet list to move the view to that object.',
  },
  'help.sidebar.search': {
    ja: '検索バーに名前を入力してリストを絞り込めます。',
    en: 'Type a name in the search bar to filter the list.',
  },
  'help.sidebar.visible': {
    ja: '「見える天体」タブで、現在の地点・時刻から見える天体を確認できます。',
    en: 'The "Visible" tab shows objects above the horizon at the current location and time.',
  },

  'help.controls.datetime': {
    ja: '右上パネルで日付と時刻を変更すると、その日時の星空が表示されます。',
    en: 'Change the date and time in the top-right panel to view the sky at that moment.',
  },
  'help.controls.location': {
    ja: '場所アイコンから都市の選択、現在地の取得、緯度経度の入力ができます。',
    en: 'Use the location icon to select a city, get your current position, or enter coordinates.',
  },
  'help.controls.reset': {
    ja: '「今に戻す」で現在日時に、「視点リセット」で初期表示に戻ります。',
    en: '"Now" resets to the current time; "Reset View" restores the default view.',
  },

  'help.display.toggle': {
    ja: '歯車アイコンから星座線・星座名・恒星名・惑星名・地平線・グリッドの表示をON/OFFできます。',
    en: 'Use the gear icon to toggle constellation lines, names, star labels, planet labels, the horizon, and the grid.',
  },
  'help.display.brightness': {
    ja: '背景の明るさスライダーで夜空の暗さを調整できます。',
    en: 'Adjust the background brightness slider to control the darkness of the night sky.',
  },

  'help.close': { ja: '閉じる', en: 'Close' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}

// 天体データ用の名前取得ヘルパー
export function localizedName(nameJa: string, nameEn: string, lang: Lang): string {
  return lang === 'ja' ? nameJa : nameEn;
}

// 月相名の取得
export function getMoonPhaseName(phase: number, lang: Lang): string {
  if (phase < 0.0625) return t('moon.new', lang);
  if (phase < 0.1875) return t('moon.waxingCrescent', lang);
  if (phase < 0.3125) return t('moon.firstQuarter', lang);
  if (phase < 0.4375) return t('moon.waxingGibbous', lang);
  if (phase < 0.5625) return t('moon.full', lang);
  if (phase < 0.6875) return t('moon.waningGibbous', lang);
  if (phase < 0.8125) return t('moon.lastQuarter', lang);
  if (phase < 0.9375) return t('moon.waningCrescent', lang);
  return t('moon.new', lang);
}
