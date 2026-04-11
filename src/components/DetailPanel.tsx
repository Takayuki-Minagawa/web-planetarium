import { useAppStore } from '../store/useAppStore';
import { constellations } from '../data/constellations';
import { stars } from '../data/stars';
import { planets } from '../data/planets';
import { specialBodies } from '../data/planets';

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

function getTypeLabel(type: string): string {
  switch (type) {
    case 'constellation': return '星座';
    case 'star': return '恒星';
    case 'planet': return '惑星';
    case 'sun': return '恒星';
    case 'moon': return '衛星';
    default: return '';
  }
}

export default function DetailPanel() {
  const { selectedBody, setSelectedBody } = useAppStore();
  if (!selectedBody) return null;

  // 追加情報を取得
  let mythology = '';
  let extraDescription = '';

  if (selectedBody.type === 'constellation') {
    const c = constellations.find(c => c.id === selectedBody.id);
    if (c) {
      mythology = c.mythology;
      extraDescription = c.description;
    }
  } else if (selectedBody.type === 'star') {
    const s = stars.find(s => s.id === selectedBody.id);
    if (s) extraDescription = s.description;
  } else if (selectedBody.type === 'planet') {
    const p = planets.find(p => p.id === selectedBody.id);
    if (p) extraDescription = p.description;
  } else {
    const b = specialBodies.find(b => b.id === selectedBody.id);
    if (b) extraDescription = b.description;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)]
      bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl
      overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/30">
        <div>
          <h3 className="text-lg font-bold text-white">{selectedBody.nameJa}</h3>
          <p className="text-sm text-gray-400">{selectedBody.nameEn}</p>
        </div>
        <button
          onClick={() => setSelectedBody(null)}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 詳細情報 */}
      <div className="p-4 space-y-3">
        {/* タイプと可視性 */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/30">
            {getTypeLabel(selectedBody.type)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full border ${
            selectedBody.isVisible
              ? 'bg-green-900/50 text-green-300 border-green-700/30'
              : 'bg-red-900/50 text-red-300 border-red-700/30'
          }`}>
            {selectedBody.isVisible ? '現在見える' : '現在見えない'}
          </span>
        </div>

        {/* 位置情報 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {selectedBody.mag != null && (
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500">等級</p>
              <p className="font-medium">{selectedBody.mag.toFixed(2)}</p>
            </div>
          )}
          {selectedBody.ra != null && (
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500">赤経</p>
              <p className="font-medium">{formatRA(selectedBody.ra)}</p>
            </div>
          )}
          {selectedBody.dec != null && (
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500">赤緯</p>
              <p className="font-medium">{formatDegrees(selectedBody.dec)}</p>
            </div>
          )}
          {selectedBody.alt != null && (
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500">高度</p>
              <p className="font-medium">{formatDegrees(selectedBody.alt)}</p>
            </div>
          )}
          {selectedBody.az != null && (
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-500">方位</p>
              <p className="font-medium">{formatDegrees(selectedBody.az)}</p>
            </div>
          )}
        </div>

        {/* 説明 */}
        {(selectedBody.description || extraDescription) && (
          <p className="text-sm text-gray-300 leading-relaxed">
            {selectedBody.description || extraDescription}
          </p>
        )}

        {/* 神話 */}
        {mythology && (
          <div className="bg-indigo-900/20 rounded-lg p-3 border border-indigo-700/20">
            <p className="text-xs text-indigo-400 font-medium mb-1">神話・豆知識</p>
            <p className="text-sm text-gray-300 leading-relaxed">{mythology}</p>
          </div>
        )}
      </div>
    </div>
  );
}
