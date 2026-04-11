import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../i18n/translations';

const CITIES = [
  { name: '東京', nameEn: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: '大阪', nameEn: 'Osaka', lat: 34.6937, lng: 135.5023 },
  { name: '札幌', nameEn: 'Sapporo', lat: 43.0621, lng: 141.3544 },
  { name: '福岡', nameEn: 'Fukuoka', lat: 33.5904, lng: 130.4017 },
  { name: '那覇', nameEn: 'Naha', lat: 26.3344, lng: 127.7675 },
  { name: 'ロンドン', nameEn: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'ニューヨーク', nameEn: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'シドニー', nameEn: 'Sydney', lat: -33.8688, lng: 151.2093 },
];

export default function ControlPanel() {
  const {
    dateTime,
    setDateTime,
    resetToNow,
    location,
    setLocation,
    skySettings,
    updateSkySettings,
    resetView,
    fov,
    setFov,
    lang,
    setLang,
    theme,
    toggleTheme,
    setHelpOpen,
  } = useAppStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const isDark = theme === 'dark';

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: lang === 'ja' ? '現在地' : 'Current',
        });
      },
      () => {}
    );
  };

  const year = dateTime.getFullYear();
  const month = String(dateTime.getMonth() + 1).padStart(2, '0');
  const day = String(dateTime.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = dateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  // Theme classes
  const panelBg = isDark ? 'bg-gray-900/90' : 'bg-white/90';
  const panelBorder = isDark ? 'border-gray-700/50' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textBody = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputCls = isDark
    ? 'bg-gray-800 border-gray-600 text-white'
    : 'bg-gray-50 border-gray-300 text-gray-900';
  const btnPrimary = isDark
    ? 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-300'
    : 'bg-blue-50 hover:bg-blue-100 text-blue-600';
  const btnSecondary = isDark
    ? 'bg-gray-700/50 hover:bg-gray-700/80 text-gray-300'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-600';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const iconBtn = `${panelBg} backdrop-blur-md rounded-lg border ${panelBorder} p-2 shadow-xl ${hoverBg} transition-colors ${isDark ? 'text-white' : 'text-gray-700'}`;

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
      {/* Date/Time */}
      <div className={`${panelBg} backdrop-blur-md rounded-xl border ${panelBorder} p-3 shadow-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-xs ${textMuted}`}>{dateStr}</p>
            <p className="text-lg font-mono font-bold">{timeStr}</p>
          </div>
          <div className="flex flex-col gap-1">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                const newDate = new Date(dateTime);
                const parts = e.target.value.split('-');
                newDate.setFullYear(+parts[0], +parts[1] - 1, +parts[2]);
                setDateTime(newDate);
              }}
              className={`border rounded px-2 py-0.5 text-xs w-32 focus:outline-none focus:border-blue-500 ${inputCls}`}
            />
            <input
              type="time"
              value={`${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`}
              onChange={(e) => {
                const newDate = new Date(dateTime);
                const [h, m] = e.target.value.split(':');
                newDate.setHours(+h, +m);
                setDateTime(newDate);
              }}
              className={`border rounded px-2 py-0.5 text-xs w-32 focus:outline-none focus:border-blue-500 ${inputCls}`}
            />
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <button onClick={resetToNow} className={`flex-1 text-xs rounded py-1 transition-colors ${btnPrimary}`}>
            {t('control.resetTime', lang)}
          </button>
          <button onClick={resetView} className={`flex-1 text-xs rounded py-1 transition-colors ${btnSecondary}`}>
            {t('control.resetView', lang)}
          </button>
        </div>
      </div>

      {/* Buttons row */}
      <div className="flex gap-1">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
          className={iconBtn}
          title={lang === 'ja' ? 'English' : '日本語'}
        >
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">
            {lang === 'ja' ? 'EN' : 'JA'}
          </span>
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className={iconBtn} title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Help */}
        <button onClick={() => setHelpOpen(true)} className={iconBtn} title={t('help.title', lang)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Location */}
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className={iconBtn}
          title={t('control.location', lang)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={iconBtn}
          title={t('control.settings', lang)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Zoom */}
        <div className={`flex flex-col ${panelBg} backdrop-blur-md rounded-lg border ${panelBorder} shadow-xl overflow-hidden ${isDark ? 'text-white' : 'text-gray-700'}`}>
          <button onClick={() => setFov(fov - 10)} className={`px-2 py-1 ${hoverBg} transition-colors text-lg`}>+</button>
          <div className={`w-full h-px ${isDark ? 'bg-gray-700/50' : 'bg-gray-200'}`} />
          <button onClick={() => setFov(fov + 10)} className={`px-2 py-1 ${hoverBg} transition-colors text-lg`}>-</button>
        </div>
      </div>

      {/* Location picker */}
      {showLocationPicker && (
        <div className={`${panelBg} backdrop-blur-md rounded-xl border ${panelBorder} p-4 shadow-2xl w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <p className="text-sm font-medium mb-3">{t('control.location', lang)}</p>
          <button
            onClick={() => { handleGetCurrentLocation(); setShowLocationPicker(false); }}
            className={`w-full text-left text-sm p-2 rounded-lg mb-2 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'} ${hoverBg}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('control.useCurrentLocation', lang)}
          </button>
          <div className="space-y-1">
            {CITIES.map(city => (
              <button
                key={city.name}
                onClick={() => {
                  setLocation({ latitude: city.lat, longitude: city.lng, name: lang === 'ja' ? city.name : city.nameEn });
                  setShowLocationPicker(false);
                }}
                className={`w-full text-left text-sm p-2 rounded-lg transition-colors ${
                  location.name === city.name || location.name === city.nameEn
                    ? (isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600')
                    : hoverBg
                }`}
              >
                {lang === 'ja' ? city.name : city.nameEn}
              </button>
            ))}
          </div>
          <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
            <p className={`text-xs mb-2 ${textMuted}`}>{t('control.latLng', lang)}</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t('control.latitude', lang)}
                step="0.01"
                defaultValue={location.latitude}
                className={`flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 ${inputCls}`}
                onBlur={(e) => {
                  const lat = parseFloat(e.target.value);
                  if (!isNaN(lat)) setLocation({ ...location, latitude: lat, name: undefined });
                }}
              />
              <input
                type="number"
                placeholder={t('control.longitude', lang)}
                step="0.01"
                defaultValue={location.longitude}
                className={`flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 ${inputCls}`}
                onBlur={(e) => {
                  const lng = parseFloat(e.target.value);
                  if (!isNaN(lng)) setLocation({ ...location, longitude: lng, name: undefined });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className={`${panelBg} backdrop-blur-md rounded-xl border ${panelBorder} p-4 shadow-2xl w-64 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <p className="text-sm font-medium mb-3">{t('control.settings', lang)}</p>
          <div className="space-y-2">
            {([
              { key: 'showConstellationLines' as const, labelKey: 'control.constellationLines' as const },
              { key: 'showConstellationNames' as const, labelKey: 'control.constellationNames' as const },
              { key: 'showStarNames' as const, labelKey: 'control.starNames' as const },
              { key: 'showPlanetNames' as const, labelKey: 'control.planetNames' as const },
              { key: 'showHorizon' as const, labelKey: 'control.horizon' as const },
              { key: 'showGrid' as const, labelKey: 'control.grid' as const },
            ]).map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                <span className={`text-sm transition-colors group-hover:${isDark ? 'text-white' : 'text-gray-900'} ${textBody}`}>
                  {t(item.labelKey, lang)}
                </span>
                <div
                  onClick={() => updateSkySettings({ [item.key]: !skySettings[item.key] })}
                  className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                    skySettings[item.key] ? 'bg-blue-600' : (isDark ? 'bg-gray-600' : 'bg-gray-300')
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    skySettings[item.key] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            ))}

            <div className={`pt-2 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
              <label className={`flex items-center justify-between text-sm ${textBody}`}>
                <span>{t('control.brightness', lang)}</span>
                <span className={`text-xs ${textMuted}`}>{Math.round(skySettings.backgroundBrightness * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={skySettings.backgroundBrightness}
                onChange={(e) => updateSkySettings({ backgroundBrightness: parseFloat(e.target.value) })}
                className="w-full mt-1 accent-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
