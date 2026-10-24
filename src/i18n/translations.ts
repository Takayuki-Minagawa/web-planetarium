import { CITIES } from '../data/cities';

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

  // Sky state
  'sky.night': { ja: '夜空', en: 'Night' },
  'sky.astronomical_twilight': { ja: '天文薄明', en: 'Astro twilight' },
  'sky.nautical_twilight': { ja: '航海薄明', en: 'Nautical twilight' },
  'sky.civil_twilight': { ja: '市民薄明', en: 'Civil twilight' },
  'sky.day': { ja: '昼間', en: 'Daytime' },

  // Discovery (星空図鑑)
  'discover.title': { ja: '星空図鑑', en: 'Sky Journal' },
  'discover.found': { ja: '発見', en: 'found' },
  'discover.cat.constellation': { ja: '星座', en: 'Constellations' },
  'discover.cat.star': { ja: '恒星', en: 'Stars' },
  'discover.cat.solar': { ja: '太陽系', en: 'Solar System' },
  'discover.next': { ja: '次の発見へ', en: 'Discover next' },
  'discover.nextHint': { ja: 'まだ見ていない天体へ案内します', en: 'Takes you to something you have not seen yet' },
  'discover.new': { ja: '新しい発見！', en: 'New discovery!' },
  'discover.complete.constellation': { ja: '星座をすべて発見しました！', en: 'All constellations discovered!' },
  'discover.complete.star': { ja: '恒星をすべて発見しました！', en: 'All stars discovered!' },
  'discover.complete.solar': { ja: '太陽系の天体をすべて発見しました！', en: 'Whole Solar System discovered!' },
  'discover.complete.all': { ja: '図鑑コンプリート！おめでとうございます', en: 'Journal complete! Congratulations' },
  'discover.discovered': { ja: '発見済み', en: 'Discovered' },

  // Sidebar extras
  'sidebar.clearSearch': { ja: '検索をクリア', en: 'Clear search' },
  'sidebar.noResults': { ja: '見つかりませんでした。別の名前で試してみてください。', en: 'Nothing found. Try another name.' },
  'sidebar.allSeasons': { ja: 'すべて', en: 'All' },
  'sidebar.aboveHorizon': { ja: '見える', en: 'Up' },
  'sidebar.belowHorizon': { ja: '地平線の下', en: 'Below horizon' },
  'sidebar.tonight': { ja: '今日の空', en: "Today's Sky" },
  'sidebar.openMenu': { ja: 'メニューを開く', en: 'Open menu' },
  'sidebar.closeMenu': { ja: 'メニューを閉じる', en: 'Close menu' },
  'sidebar.illumination': { ja: '輝面比', en: 'Illuminated' },

  // Control extras
  'control.live': { ja: '現在', en: 'Live' },
  'control.timeTravel': { ja: '時間旅行中', en: 'Time travel' },
  'control.minus1h': { ja: '1時間戻す', en: 'Back 1 hour' },
  'control.plus1h': { ja: '1時間進める', en: 'Forward 1 hour' },
  'control.play': { ja: '時間を早送りして星の動きを見る', en: 'Fast-forward time to watch the sky move' },
  'control.pause': { ja: '早送りを止める', en: 'Pause fast-forward' },
  'control.zoomIn': { ja: '拡大', en: 'Zoom in' },
  'control.zoomOut': { ja: '縮小', en: 'Zoom out' },
  'control.language': { ja: 'English に切り替え', en: '日本語に切り替え' },
  'control.themeLight': { ja: 'ライトモードに切り替え', en: 'Switch to light mode' },
  'control.themeDark': { ja: 'ダークモードに切り替え', en: 'Switch to dark mode' },
  'control.milkyWay': { ja: '天の川', en: 'Milky Way' },
  'control.locating': { ja: '現在地を取得中…', en: 'Locating…' },
  'control.locationError': { ja: '現在地を取得できませんでした', en: 'Could not get your location' },
  'control.expand': { ja: '日時パネルを開く', en: 'Expand time panel' },
  'control.collapse': { ja: '日時パネルをたたむ', en: 'Collapse time panel' },

  // Detail extras
  'detail.close': { ja: '詳細を閉じる', en: 'Close details' },
  'detail.where': { ja: '空のどこにある？', en: 'Where in the sky?' },
  'detail.inSky': { ja: 'の空', en: ' sky' },
  'detail.belowHorizon': { ja: 'いまは地平線の下にあります', en: 'Currently below the horizon' },
  'detail.height': { ja: '高さ', en: 'Height' },
  'detail.alt.horizon': { ja: '地平線すれすれ', en: 'just above the horizon' },
  'detail.alt.low': { ja: '低め', en: 'low' },
  'detail.alt.mid': { ja: '中くらいの高さ', en: 'mid-height' },
  'detail.alt.high': { ja: '高い位置', en: 'high up' },
  'detail.alt.zenith': { ja: 'ほぼ真上', en: 'nearly overhead' },
  'detail.brightness': { ja: '明るさ', en: 'Brightness' },
  'detail.magHint': { ja: '等級は数字が小さいほど明るく、肉眼の限界はおよそ6等です。', en: 'Smaller magnitudes are brighter. The naked-eye limit is about 6.' },
  'detail.bright.dazzling': { ja: 'まばゆい明るさ', en: 'dazzling' },
  'detail.bright.veryBright': { ja: 'とても明るい', en: 'very bright' },
  'detail.bright.bright': { ja: '明るい', en: 'bright' },
  'detail.bright.moderate': { ja: '街でも見える', en: 'visible from cities' },
  'detail.bright.faint': { ja: '暗い空で見える', en: 'needs a dark sky' },
  'detail.mainStars': { ja: 'この星座の主な星', en: 'Main stars' },
  'detail.inConstellation': { ja: '所属する星座', en: 'Constellation' },
  'detail.data': { ja: '観測データ', en: 'Observation data' },
  'detail.phase': { ja: '月の形', en: 'Phase' },

  // Directions (16-point)
  'dir16.0': { ja: '北', en: 'north' },
  'dir16.1': { ja: '北北東', en: 'north-northeast' },
  'dir16.2': { ja: '北東', en: 'northeast' },
  'dir16.3': { ja: '東北東', en: 'east-northeast' },
  'dir16.4': { ja: '東', en: 'east' },
  'dir16.5': { ja: '東南東', en: 'east-southeast' },
  'dir16.6': { ja: '南東', en: 'southeast' },
  'dir16.7': { ja: '南南東', en: 'south-southeast' },
  'dir16.8': { ja: '南', en: 'south' },
  'dir16.9': { ja: '南南西', en: 'south-southwest' },
  'dir16.10': { ja: '南西', en: 'southwest' },
  'dir16.11': { ja: '西南西', en: 'west-southwest' },
  'dir16.12': { ja: '西', en: 'west' },
  'dir16.13': { ja: '西北西', en: 'west-northwest' },
  'dir16.14': { ja: '北西', en: 'northwest' },
  'dir16.15': { ja: '北北西', en: 'north-northwest' },

  // Welcome
  'welcome.kicker': { ja: 'ようこそ', en: 'Welcome' },
  'welcome.title': { ja: '今夜は、どんな星に出会えるだろう。', en: 'What will you find in tonight’s sky?' },
  'welcome.lead': {
    ja: '観測地点と日時から、本物の星空をリアルタイムに再現します。気になる星をタップして、星座の形や神話を探検しましょう。',
    en: 'Your sky is recreated in real time from your location and time. Tap anything that catches your eye to explore shapes, stories and science.',
  },
  'welcome.highlights': { ja: '今夜の見どころ', en: 'Tonight’s highlights' },
  'welcome.dayNote': { ja: 'いまは明るい時間帯なので、今夜21時の空からおすすめを選びました。', en: 'It is light out now, so these picks are for 9 PM tonight.' },
  'welcome.moon': { ja: '今夜の月', en: 'Tonight’s Moon' },
  'welcome.planets': { ja: '見える惑星', en: 'Planets up' },
  'welcome.brightest': { ja: 'いちばん明るい星', en: 'Brightest star' },
  'welcome.constellation': { ja: '見ごろの星座', en: 'Constellation to find' },
  'welcome.noPlanets': { ja: 'なし', en: 'None' },
  'welcome.tip.drag': { ja: 'ドラッグで空を見回す', en: 'Drag to look around' },
  'welcome.tip.tap': { ja: 'タップして詳しく知る', en: 'Tap to learn more' },
  'welcome.tip.collect': { ja: '見つけた天体は図鑑に記録', en: 'Finds are saved to your journal' },
  'welcome.start': { ja: '星空を眺める', en: 'Start stargazing' },
  'welcome.reopen': { ja: 'ようこそ画面を表示', en: 'Show welcome screen' },

  // Help extras
  'help.section.keyboard': { ja: 'キーボード操作', en: 'Keyboard' },
  'help.keyboard.arrows': { ja: '星空を選択した状態で、矢印キーで視点を移動できます。', en: 'With the sky focused, use the arrow keys to look around.' },
  'help.keyboard.zoom': { ja: '＋／－キーで拡大・縮小、Esc で選択を解除します。', en: 'Use + / − to zoom and Esc to clear the selection.' },
  'help.display.timelapse': {
    ja: '▶ ボタンで時間を早送りすると、星が東から西へ動く様子を観察できます。',
    en: 'Press ▶ to fast-forward time and watch the stars wheel from east to west.',
  },
  'help.sidebar.journal': {
    ja: '詳細を開いた天体は「星空図鑑」に記録されます。「次の発見へ」で未発見の天体へ案内します。',
    en: 'Every object you open is saved to your Sky Journal. “Discover next” guides you to something new.',
  },

  'canvas.label': {
    ja: '星空。ドラッグまたは矢印キーで見回し、天体をクリックすると詳細を表示します。',
    en: 'The sky. Drag or use arrow keys to look around; click an object for details.',
  },
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

// 観測地点名を表示言語に合わせる
export function locationLabel(location: { latitude: number; longitude: number; name?: string }, lang: Lang): string {
  if (location.name === '現在地' || location.name === 'Current') return lang === 'ja' ? '現在地' : 'Current';
  const city = CITIES.find((c) => c.name === location.name || c.nameEn === location.name);
  if (city) return lang === 'ja' ? city.name : city.nameEn;
  return location.name || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
}

// 方位角を16方位の名前に変換
export function directionName(az: number, lang: Lang): string {
  const idx = Math.round((((az % 360) + 360) % 360) / 22.5) % 16;
  return t(`dir16.${idx}` as TranslationKey, lang);
}

// 高度をわかりやすい言葉に変換
export function altitudeDescription(alt: number, lang: Lang): string {
  if (alt < 10) return t('detail.alt.horizon', lang);
  if (alt < 30) return t('detail.alt.low', lang);
  if (alt < 60) return t('detail.alt.mid', lang);
  if (alt < 80) return t('detail.alt.high', lang);
  return t('detail.alt.zenith', lang);
}

// 等級をわかりやすい言葉に変換
export function brightnessDescription(mag: number, lang: Lang): string {
  if (mag < -1) return t('detail.bright.dazzling', lang);
  if (mag < 0.5) return t('detail.bright.veryBright', lang);
  if (mag < 1.5) return t('detail.bright.bright', lang);
  if (mag < 2.5) return t('detail.bright.moderate', lang);
  return t('detail.bright.faint', lang);
}
