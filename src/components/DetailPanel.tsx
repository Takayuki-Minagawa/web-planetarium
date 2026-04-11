import { useAppStore } from '../store/useAppStore';
import { constellations } from '../data/constellations';
import { stars } from '../data/stars';
import { planets } from '../data/planets';
import { specialBodies } from '../data/planets';
import { t, localizedName } from '../i18n/translations';

function formatDegrees(deg: number | undefined): string {
  if (deg == null) return '--';
  return `${deg.toFixed(1)}°`;
}

function formatRA(ra: number | undefined): string {
  if (ra == null) return '--';
  const h = Math.floor(ra);
  const m = Math.floor((ra - h) * 60);
  const s = Math.round(((ra - h) * 60 - m) * 60);
  return `${h}h ${m}m ${s}s`;
}

export default function DetailPanel() {
  const { selectedBody, setSelectedBody, lang, theme } = useAppStore();
  if (!selectedBody) return null;

  const isDark = theme === 'dark';

  let mythology = '';
  let mythologyEn = '';
  let extraDescription = '';
  let extraDescriptionEn = '';

  if (selectedBody.type === 'constellation') {
    const c = constellations.find(c => c.id === selectedBody.id);
    if (c) {
      mythology = c.mythology;
      mythologyEn = c.mythologyEn;
      extraDescription = c.description;
      extraDescriptionEn = c.descriptionEn;
    }
  } else if (selectedBody.type === 'star') {
    const s = stars.find(s => s.id === selectedBody.id);
    if (s) {
      extraDescription = s.description;
      extraDescriptionEn = s.descriptionEn;
    }
  } else if (selectedBody.type === 'planet') {
    const p = planets.find(p => p.id === selectedBody.id);
    if (p) {
      extraDescription = p.description;
      extraDescriptionEn = p.descriptionEn;
    }
  } else {
    const b = specialBodies.find(b => b.id === selectedBody.id);
    if (b) {
      extraDescription = b.description;
      extraDescriptionEn = b.descriptionEn;
    }
  }

  const description = lang === 'ja'
    ? (selectedBody.description || extraDescription)
    : (selectedBody.descriptionEn || extraDescriptionEn);

  const mythText = lang === 'ja' ? mythology : mythologyEn;

  const bg = isDark ? 'bg-gray-900/95' : 'bg-white/95';
  const border = isDark ? 'border-gray-700/50' : 'border-gray-200';
  const cardBg = isDark ? 'bg-gray-800/50' : 'bg-gray-50';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)]
      backdrop-blur-md rounded-xl border shadow-2xl overflow-hidden
      ${bg} ${border} ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700/30' : 'border-gray-200'}`}>
        <div>
          <h3 className="text-lg font-bold">{localizedName(selectedBody.nameJa, selectedBody.nameEn, lang)}</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {lang === 'ja' ? selectedBody.nameEn : selectedBody.nameJa}
          </p>
        </div>
        <button
          onClick={() => setSelectedBody(null)}
          className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Type & visibility */}
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full border ${
            isDark ? 'bg-blue-900/50 text-blue-300 border-blue-700/30' : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            {t(`detail.type.${selectedBody.type}` as Parameters<typeof t>[0], lang)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full border ${
            selectedBody.isVisible
              ? (isDark ? 'bg-green-900/50 text-green-300 border-green-700/30' : 'bg-green-50 text-green-600 border-green-200')
              : (isDark ? 'bg-red-900/50 text-red-300 border-red-700/30' : 'bg-red-50 text-red-600 border-red-200')
          }`}>
            {selectedBody.isVisible ? t('detail.visible', lang) : t('detail.notVisible', lang)}
          </span>
        </div>

        {/* Position info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {selectedBody.mag != null && (
            <div className={`rounded-lg p-2 ${cardBg}`}>
              <p className={`text-xs ${textMuted}`}>{t('detail.magnitude', lang)}</p>
              <p className="font-medium">{selectedBody.mag.toFixed(2)}</p>
            </div>
          )}
          {selectedBody.ra != null && (
            <div className={`rounded-lg p-2 ${cardBg}`}>
              <p className={`text-xs ${textMuted}`}>{t('detail.ra', lang)}</p>
              <p className="font-medium">{formatRA(selectedBody.ra)}</p>
            </div>
          )}
          {selectedBody.dec != null && (
            <div className={`rounded-lg p-2 ${cardBg}`}>
              <p className={`text-xs ${textMuted}`}>{t('detail.dec', lang)}</p>
              <p className="font-medium">{formatDegrees(selectedBody.dec)}</p>
            </div>
          )}
          {selectedBody.alt != null && (
            <div className={`rounded-lg p-2 ${cardBg}`}>
              <p className={`text-xs ${textMuted}`}>{t('detail.altitude', lang)}</p>
              <p className="font-medium">{formatDegrees(selectedBody.alt)}</p>
            </div>
          )}
          {selectedBody.az != null && (
            <div className={`rounded-lg p-2 ${cardBg}`}>
              <p className={`text-xs ${textMuted}`}>{t('detail.azimuth', lang)}</p>
              <p className="font-medium">{formatDegrees(selectedBody.az)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {description}
          </p>
        )}

        {/* Mythology */}
        {mythText && (
          <div className={`rounded-lg p-3 border ${
            isDark ? 'bg-indigo-900/20 border-indigo-700/20' : 'bg-indigo-50 border-indigo-100'
          }`}>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {t('detail.mythology', lang)}
            </p>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{mythText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
