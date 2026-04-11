import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { constellations } from '../data/constellations';
import { stars } from '../data/stars';
import { planets } from '../data/planets';
import { specialBodies } from '../data/planets';
import {
  equatorialToHorizontal,
  getPlanetPosition,
  getMoonPosition,
  getSunPosition,
  getMoonPhase,
  getVisibleBodies,
  getSunTimes,
  getMoonTimes,
} from '../utils/astronomy';
import { t, localizedName, getMoonPhaseName } from '../i18n/translations';

const SEASON_KEYS: Record<string, string> = {
  spring: 'season.spring',
  summer: 'season.summer',
  autumn: 'season.autumn',
  winter: 'season.winter',
  all: 'season.all',
};

export default function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    location,
    dateTime,
    setSelectedBody,
    setCenterAz,
    setCenterAlt,
    selectedBody,
    lang,
    theme,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';

  const tabs: { id: 'constellations' | 'stars' | 'planets' | 'visible'; labelKey: Parameters<typeof t>[0] }[] = [
    { id: 'constellations', labelKey: 'tab.constellations' },
    { id: 'stars', labelKey: 'tab.stars' },
    { id: 'planets', labelKey: 'tab.planets' },
    { id: 'visible', labelKey: 'tab.visible' },
  ];

  const handleSelectConstellation = (constellation: typeof constellations[0]) => {
    const starMap = new Map(stars.map(s => [s.id, s]));
    const mainStars = constellation.mainStars.map(id => starMap.get(id)).filter(Boolean);
    if (mainStars.length === 0) return;

    let sumRa = 0, sumDec = 0;
    for (const s of mainStars) {
      if (!s) continue;
      sumRa += s.ra;
      sumDec += s.dec;
    }
    const avgRa = sumRa / mainStars.length;
    const avgDec = sumDec / mainStars.length;
    const pos = equatorialToHorizontal(avgRa, avgDec, dateTime, location);

    setCenterAz(pos.az);
    setCenterAlt(Math.max(0, pos.alt));
    setSelectedBody({
      id: constellation.id,
      nameJa: constellation.nameJa,
      nameEn: constellation.nameEn,
      type: 'constellation',
      alt: pos.alt,
      az: pos.az,
      isVisible: pos.alt > 0,
      description: constellation.description,
      descriptionEn: constellation.descriptionEn,
    });
  };

  const handleSelectStar = (star: typeof stars[0]) => {
    const pos = equatorialToHorizontal(star.ra, star.dec, dateTime, location);
    setCenterAz(pos.az);
    setCenterAlt(Math.max(0, pos.alt));
    setSelectedBody({
      id: star.id,
      nameJa: star.nameJa,
      nameEn: star.nameEn,
      type: 'star',
      ra: star.ra,
      dec: star.dec,
      alt: pos.alt,
      az: pos.az,
      mag: star.mag,
      isVisible: pos.alt > 0,
      description: star.description,
      descriptionEn: star.descriptionEn,
    });
  };

  const handleSelectPlanet = (planet: typeof planets[0]) => {
    const pos = getPlanetPosition(planet.id, dateTime, location);
    if (!pos) return;
    const horizPos = equatorialToHorizontal(pos.ra, pos.dec, dateTime, location);
    setCenterAz(horizPos.az);
    setCenterAlt(Math.max(0, horizPos.alt));
    setSelectedBody({
      id: planet.id,
      nameJa: planet.nameJa,
      nameEn: planet.nameEn,
      type: 'planet',
      ra: pos.ra,
      dec: pos.dec,
      alt: horizPos.alt,
      az: horizPos.az,
      mag: pos.mag,
      isVisible: horizPos.alt > 0,
      description: planet.description,
      descriptionEn: planet.descriptionEn,
    });
  };

  const handleSelectSpecial = (body: typeof specialBodies[0]) => {
    const pos = body.id === 'sun' ? getSunPosition(dateTime, location) : getMoonPosition(dateTime, location);
    const horizPos = equatorialToHorizontal(pos.ra, pos.dec, dateTime, location);
    setCenterAz(horizPos.az);
    setCenterAlt(Math.max(0, horizPos.alt));

    let description = body.description;
    let descriptionEn = body.descriptionEn;
    if (body.id === 'moon') {
      const phase = getMoonPhase(dateTime);
      const phaseName = getMoonPhaseName(phase.phase, lang);
      description = `${phaseName}（${Math.round(phase.illumination * 100)}%）`;
      descriptionEn = `${getMoonPhaseName(phase.phase, 'en')} (${Math.round(phase.illumination * 100)}%)`;
    }

    setSelectedBody({
      id: body.id,
      nameJa: body.nameJa,
      nameEn: body.nameEn,
      type: body.id as 'sun' | 'moon',
      ra: pos.ra,
      dec: pos.dec,
      alt: horizPos.alt,
      az: horizPos.az,
      isVisible: horizPos.alt > 0,
      description,
      descriptionEn,
    });
  };

  const filteredConstellations = useMemo(() => {
    if (!searchQuery) return constellations;
    const q = searchQuery.toLowerCase();
    return constellations.filter(c =>
      c.nameJa.includes(q) || c.nameEn.toLowerCase().includes(q) || c.searchKeywords.some(k => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredStars = useMemo(() => {
    if (!searchQuery) return stars.filter(s => s.mag < 2.5);
    const q = searchQuery.toLowerCase();
    return stars.filter(s =>
      s.nameJa.includes(q) || s.nameEn.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const visibleBodies = useMemo(() => getVisibleBodies(dateTime, location), [dateTime, location]);
  const sunTimes = useMemo(() => getSunTimes(dateTime, location), [dateTime, location]);
  const moonTimes = useMemo(() => getMoonTimes(dateTime, location), [dateTime, location]);
  const moonPhase = useMemo(() => getMoonPhase(dateTime), [dateTime]);

  const formatTime = (d: Date | undefined) =>
    d ? d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  // Theme classes
  const bg = isDark ? 'bg-gray-900/95' : 'bg-white/95';
  const border = isDark ? 'border-gray-700/50' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textBody = isDark ? 'text-gray-300' : 'text-gray-700';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const selectedBg = isDark ? 'bg-blue-900/50 border border-blue-500/50' : 'bg-blue-50 border border-blue-300';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400';
  const badgeBg = isDark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500';
  const cardBg = isDark ? 'bg-gray-800/50' : 'bg-gray-50';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg border backdrop-blur-sm ${
          isDark ? 'bg-gray-800/80 border-gray-700 text-white' : 'bg-white/80 border-gray-200 text-gray-900'
        }`}
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <div className={`
        fixed top-0 left-0 h-full z-40
        w-80 backdrop-blur-md border-r
        transition-transform duration-300 flex flex-col
        ${bg} ${border}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className={`p-4 border-b ${border}`}>
          <h1 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
            <span className="text-2xl">&#11088;</span>
            {t('app.title', lang)}
          </h1>
          <p className={`text-xs mt-1 ${textMuted}`}>
            {location.name || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
          </p>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            type="text"
            placeholder={t('sidebar.search', lang)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${inputBg}`}
          />
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${border}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors
                ${activeTab === tab.id
                  ? `${isDark ? 'text-blue-400' : 'text-blue-600'} border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`
                  : `${textMuted} ${hoverBg}`
                }`}
            >
              {t(tab.labelKey, lang)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'constellations' && (
            <div className="p-2">
              {filteredConstellations.map(c => {
                const isSelected = selectedBody?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConstellation(c)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                      isSelected ? selectedBg : hoverBg
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {localizedName(c.nameJa, c.nameEn, lang)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${badgeBg}`}>
                        {t(SEASON_KEYS[c.season] as Parameters<typeof t>[0], lang)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${textMuted}`}>
                      {lang === 'ja' ? c.nameEn : c.nameJa}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'stars' && (
            <div className="p-2">
              {filteredStars.map(s => {
                const isSelected = selectedBody?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStar(s)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                      isSelected ? selectedBg : hoverBg
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {localizedName(s.nameJa, s.nameEn, lang)}
                        </span>
                      </div>
                      <span className={`text-xs ${textMuted}`}>{s.mag.toFixed(1)}{t('sidebar.magnitude', lang)}</span>
                    </div>
                    <p className={`text-xs mt-1 ${textMuted}`}>{lang === 'ja' ? s.nameEn : s.nameJa}</p>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="p-2">
              <p className={`text-xs px-3 py-1 font-medium ${textMuted}`}>{t('sidebar.sunMoon', lang)}</p>
              {specialBodies.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectSpecial(b)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    selectedBody?.id === b.id ? selectedBg : hoverBg
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.symbol}</span>
                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {localizedName(b.nameJa, b.nameEn, lang)}
                    </span>
                  </div>
                </button>
              ))}

              <p className={`text-xs px-3 py-1 mt-2 font-medium ${textMuted}`}>{t('sidebar.planets', lang)}</p>
              {planets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlanet(p)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    selectedBody?.id === p.id ? selectedBg : hoverBg
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ color: p.color }}>{p.symbol}</span>
                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {localizedName(p.nameJa, p.nameEn, lang)}
                    </span>
                    <span className={`text-xs ${textMuted}`}>{lang === 'ja' ? p.nameEn : p.nameJa}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'visible' && (
            <div className="p-2">
              <div className={`rounded-lg p-3 mb-3 ${cardBg}`}>
                <p className={`text-xs font-medium mb-2 ${textMuted}`}>{t('sidebar.astroInfo', lang)}</p>
                <div className="space-y-1 text-xs">
                  {([
                    ['sidebar.sunrise', sunTimes.sunrise],
                    ['sidebar.sunset', sunTimes.sunset],
                    ['sidebar.moonrise', moonTimes.rise],
                    ['sidebar.moonset', moonTimes.set],
                  ] as const).map(([key, time]) => (
                    <div key={key} className="flex justify-between">
                      <span className={textMuted}>{t(key, lang)}</span>
                      <span className={textBody}>{formatTime(time)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className={textMuted}>{t('sidebar.moonPhase', lang)}</span>
                    <span className={textBody}>
                      {getMoonPhaseName(moonPhase.phase, lang)}
                      ({Math.round(moonPhase.illumination * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              <p className={`text-xs px-3 py-1 font-medium ${textMuted}`}>
                {t('sidebar.visibleNow', lang)} ({visibleBodies.filter(b => b.isVisible).length})
              </p>
              {visibleBodies
                .filter(b => b.isVisible)
                .sort((a, b) => (a.mag ?? 99) - (b.mag ?? 99))
                .map(body => (
                  <button
                    key={body.id}
                    onClick={() => {
                      if (body.alt != null && body.az != null) {
                        setCenterAz(body.az);
                        setCenterAlt(Math.max(0, body.alt));
                      }
                      setSelectedBody(body);
                    }}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                      selectedBody?.id === body.id ? selectedBg : hoverBg
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          body.type === 'star' ? (isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-50 text-yellow-700') :
                          body.type === 'planet' ? (isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-50 text-purple-700') :
                          badgeBg
                        }`}>
                          {body.type === 'star' ? t('sidebar.typeStar', lang) :
                           body.type === 'planet' ? t('sidebar.typePlanet', lang) :
                           body.type === 'moon' ? t('sidebar.typeMoon', lang) : ''}
                        </span>
                        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {localizedName(body.nameJa, body.nameEn, lang)}
                        </span>
                      </div>
                      {body.mag != null && (
                        <span className={`text-xs ${textMuted}`}>{body.mag.toFixed(1)}{t('sidebar.magnitude', lang)}</span>
                      )}
                    </div>
                    <div className={`flex gap-3 mt-1 text-xs ${textMuted}`}>
                      {body.alt != null && <span>{t('sidebar.altitude', lang)} {body.alt.toFixed(0)}°</span>}
                      {body.az != null && <span>{t('sidebar.azimuth', lang)} {body.az.toFixed(0)}°</span>}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
