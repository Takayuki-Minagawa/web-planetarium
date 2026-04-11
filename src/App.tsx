import SkyCanvas from './components/SkyCanvas';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import ControlPanel from './components/ControlPanel';
import HelpModal from './components/HelpModal';
import { useAppStore } from './store/useAppStore';

function App() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <div className={`w-full h-full relative ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sky canvas */}
      <div className={`absolute inset-0 transition-all duration-300 ${sidebarOpen ? 'md:left-80' : 'left-0'}`}>
        <SkyCanvas />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Control panel */}
      <ControlPanel />

      {/* Detail panel */}
      <DetailPanel />

      {/* Help modal */}
      <HelpModal />
    </div>
  );
}

export default App;
