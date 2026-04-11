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

const SEASON_LABELS: Record<string, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
  all: '通年',
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
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'constellations' as const, label: '星座' },
    { id: 'stars' as const, label: '恒星' },
    { id: 'planets' as const, label: '惑星' },
    { id: 'visible' as const, label: '見える天体' },
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
    });
  };

  const handleSelectSpecial = (body: typeof specialBodies[0]) => {
    const pos = body.id === 'sun' ? getSunPosition(dateTime, location) : getMoonPosition(dateTime, location);
    const horizPos = equatorialToHorizontal(pos.ra, pos.dec, dateTime, location);
    setCenterAz(horizPos.az);
    setCenterAlt(Math.max(0, horizPos.alt));

    let description = body.description;
    if (body.id === 'moon') {
      const phase = getMoonPhase(dateTime);
      description = `${phase.phaseName}（輝面比 ${Math.round(phase.illumination * 100)}%）`;
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

  return (
    <>
      {/* モバイル用トグルボタン */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800/80 backdrop-blur-sm p-2 rounded-lg border border-gray-700"
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
        w-80 bg-gray-900/95 backdrop-blur-md border-r border-gray-700/50
        transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-700/50">
          <h1 className="text-lg font-bold text-blue-300 flex items-center gap-2">
            <span className="text-2xl">&#11088;</span>
            Web Planetarium
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {location.name || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
          </p>
        </div>

        {/* 検索 */}
        <div className="px-4 py-2">
          <input
            type="text"
            placeholder="天体を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm
              focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
          />
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
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
                      isSelected ? 'bg-blue-900/50 border border-blue-500/50' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.nameJa}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-700/50 text-gray-400">
                        {SEASON_LABELS[c.season]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{c.nameEn}</p>
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
                      isSelected ? 'bg-blue-900/50 border border-blue-500/50' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="font-medium text-sm">{s.nameJa}</span>
                      </div>
                      <span className="text-xs text-gray-500">{s.mag.toFixed(1)}等</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{s.nameEn}</p>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="p-2">
              {/* 太陽・月 */}
              <p className="text-xs text-gray-500 px-3 py-1 font-medium">太陽・月</p>
              {specialBodies.map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectSpecial(b)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    selectedBody?.id === b.id ? 'bg-blue-900/50 border border-blue-500/50' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.symbol}</span>
                    <span className="font-medium text-sm">{b.nameJa}</span>
                  </div>
                </button>
              ))}

              <p className="text-xs text-gray-500 px-3 py-1 mt-2 font-medium">惑星</p>
              {planets.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPlanet(p)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    selectedBody?.id === p.id ? 'bg-blue-900/50 border border-blue-500/50' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg" style={{ color: p.color }}>{p.symbol}</span>
                    <span className="font-medium text-sm">{p.nameJa}</span>
                    <span className="text-xs text-gray-500">{p.nameEn}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'visible' && (
            <div className="p-2">
              {/* 天文情報カード */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-gray-400 mb-2">天文情報</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">日の出</span>
                    <span>{sunTimes.sunrise ? sunTimes.sunrise.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">日の入り</span>
                    <span>{sunTimes.sunset ? sunTimes.sunset.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">月の出</span>
                    <span>{moonTimes.rise ? moonTimes.rise.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">月の入り</span>
                    <span>{moonTimes.set ? moonTimes.set.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">月相</span>
                    <span>{moonPhase.phaseName}（{Math.round(moonPhase.illumination * 100)}%）</span>
                  </div>
                </div>
              </div>

              {/* 見える天体一覧 */}
              <p className="text-xs text-gray-500 px-3 py-1 font-medium">
                現在見える天体 ({visibleBodies.filter(b => b.isVisible).length})
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
                      selectedBody?.id === body.id ? 'bg-blue-900/50 border border-blue-500/50' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          body.type === 'star' ? 'bg-yellow-900/50 text-yellow-400' :
                          body.type === 'planet' ? 'bg-purple-900/50 text-purple-400' :
                          'bg-gray-700/50 text-gray-400'
                        }`}>
                          {body.type === 'star' ? '恒星' : body.type === 'planet' ? '惑星' : body.type === 'moon' ? '月' : ''}
                        </span>
                        <span className="font-medium text-sm">{body.nameJa}</span>
                      </div>
                      {body.mag != null && (
                        <span className="text-xs text-gray-500">{body.mag.toFixed(1)}等</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      {body.alt != null && <span>高度 {body.alt.toFixed(0)}°</span>}
                      {body.az != null && <span>方位 {body.az.toFixed(0)}°</span>}
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
