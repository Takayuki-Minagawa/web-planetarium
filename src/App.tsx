import SkyCanvas from './components/SkyCanvas';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import ControlPanel from './components/ControlPanel';
import { useAppStore } from './store/useAppStore';

function App() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="w-full h-full relative">
      {/* 星空キャンバス */}
      <div className={`absolute inset-0 transition-all duration-300 ${sidebarOpen ? 'md:left-80' : 'left-0'}`}>
        <SkyCanvas />
      </div>

      {/* サイドバー */}
      <Sidebar />

      {/* コントロールパネル */}
      <ControlPanel />

      {/* 詳細パネル */}
      <DetailPanel />
    </div>
  );
}

export default App;
