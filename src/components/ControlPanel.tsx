import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const CITIES = [
  { name: '東京', lat: 35.6762, lng: 139.6503 },
  { name: '大阪', lat: 34.6937, lng: 135.5023 },
  { name: '札幌', lat: 43.0621, lng: 141.3544 },
  { name: '福岡', lat: 33.5904, lng: 130.4017 },
  { name: '那覇', lat: 26.3344, lng: 127.7675 },
  { name: 'ロンドン', lat: 51.5074, lng: -0.1278 },
  { name: 'ニューヨーク', lat: 40.7128, lng: -74.0060 },
  { name: 'シドニー', lat: -33.8688, lng: 151.2093 },
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
  } = useAppStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // 現在地取得
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: '現在地',
        });
      },
      () => {
        // デフォルトの東京を使用
      }
    );
  };

  // 日時フォーマット
  const dateStr = dateTime.toISOString().slice(0, 10);
  const timeStr = dateTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
      {/* 日時表示 */}
      <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-700/50 p-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">{dateStr}</p>
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
              className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs w-32
                focus:outline-none focus:border-blue-500"
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
              className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs w-32
                focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <button
            onClick={resetToNow}
            className="flex-1 text-xs bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded py-1 transition-colors"
          >
            今に戻す
          </button>
          <button
            onClick={resetView}
            className="flex-1 text-xs bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 rounded py-1 transition-colors"
          >
            視点リセット
          </button>
        </div>
      </div>

      {/* 操作ボタン群 */}
      <div className="flex gap-1">
        {/* 場所 */}
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className="bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700/50 p-2 shadow-xl
            hover:bg-gray-800/90 transition-colors"
          title="場所を変更"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* 設定 */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700/50 p-2 shadow-xl
            hover:bg-gray-800/90 transition-colors"
          title="表示設定"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* ズームコントロール */}
        <div className="flex flex-col bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-xl overflow-hidden">
          <button
            onClick={() => setFov(fov - 10)}
            className="px-2 py-1 hover:bg-gray-800 transition-colors text-lg"
            title="ズームイン"
          >+</button>
          <div className="w-full h-px bg-gray-700/50" />
          <button
            onClick={() => setFov(fov + 10)}
            className="px-2 py-1 hover:bg-gray-800 transition-colors text-lg"
            title="ズームアウト"
          >-</button>
        </div>
      </div>

      {/* 場所選択パネル */}
      {showLocationPicker && (
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 p-4 shadow-2xl w-64">
          <p className="text-sm font-medium mb-3">観測地点</p>
          <button
            onClick={() => { handleGetCurrentLocation(); setShowLocationPicker(false); }}
            className="w-full text-left text-sm p-2 rounded-lg hover:bg-gray-800 mb-2
              flex items-center gap-2 text-blue-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            現在地を使用
          </button>
          <div className="space-y-1">
            {CITIES.map(city => (
              <button
                key={city.name}
                onClick={() => {
                  setLocation({ latitude: city.lat, longitude: city.lng, name: city.name });
                  setShowLocationPicker(false);
                }}
                className={`w-full text-left text-sm p-2 rounded-lg transition-colors ${
                  location.name === city.name ? 'bg-blue-900/50 text-blue-300' : 'hover:bg-gray-800'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
          {/* 手入力 */}
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 mb-2">緯度・経度を入力</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="緯度"
                step="0.01"
                defaultValue={location.latitude}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs
                  focus:outline-none focus:border-blue-500"
                onBlur={(e) => {
                  const lat = parseFloat(e.target.value);
                  if (!isNaN(lat)) setLocation({ ...location, latitude: lat, name: undefined });
                }}
              />
              <input
                type="number"
                placeholder="経度"
                step="0.01"
                defaultValue={location.longitude}
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs
                  focus:outline-none focus:border-blue-500"
                onBlur={(e) => {
                  const lng = parseFloat(e.target.value);
                  if (!isNaN(lng)) setLocation({ ...location, longitude: lng, name: undefined });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 表示設定パネル */}
      {showSettings && (
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 p-4 shadow-2xl w-64">
          <p className="text-sm font-medium mb-3">表示設定</p>
          <div className="space-y-2">
            {[
              { key: 'showConstellationLines' as const, label: '星座線' },
              { key: 'showConstellationNames' as const, label: '星座名' },
              { key: 'showStarNames' as const, label: '恒星名' },
              { key: 'showPlanetNames' as const, label: '惑星名' },
              { key: 'showHorizon' as const, label: '地平線' },
              { key: 'showGrid' as const, label: 'グリッド' },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                <div
                  onClick={() => updateSkySettings({ [item.key]: !skySettings[item.key] })}
                  className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                    skySettings[item.key] ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    skySettings[item.key] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            ))}

            <div className="pt-2 border-t border-gray-700/50">
              <label className="flex items-center justify-between text-sm text-gray-300">
                <span>背景の明るさ</span>
                <span className="text-xs text-gray-500">{Math.round(skySettings.backgroundBrightness * 100)}%</span>
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
