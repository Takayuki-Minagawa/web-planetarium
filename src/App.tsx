import { useEffect } from 'react';
import SkyCanvas from './components/SkyCanvas';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import ControlPanel from './components/ControlPanel';
import HelpModal from './components/HelpModal';
import WelcomeModal from './components/WelcomeModal';
import DiscoveryToast from './components/DiscoveryToast';
import { useAppStore } from './store/useAppStore';

// 早送り時、現実の1秒で進む時間（分）
const TIMELAPSE_MINUTES_PER_SECOND = 20;

function App() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const theme = useAppStore((s) => s.theme);
  const lang = useAppStore((s) => s.lang);
  const live = useAppStore((s) => s.live);
  const playing = useAppStore((s) => s.playing);

  // テーマと言語を文書全体に反映
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // 「現在」表示中は時計を進めてリアルタイムの空を保つ
  useEffect(() => {
    if (!live || playing) return;
    const timer = setInterval(() => useAppStore.getState().tickNow(), 30_000);
    return () => clearInterval(timer);
  }, [live, playing]);

  // 時間の早送り
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      if (dt >= 33) {
        const { dateTime, advanceTime } = useAppStore.getState();
        advanceTime(new Date(dateTime.getTime() + dt * TIMELAPSE_MINUTES_PER_SECOND * 60));
        last = now;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-app text-ink">
      {/* Sky canvas */}
      <main className={`absolute inset-0 transition-[left] duration-300 ease-out ${sidebarOpen ? 'md:left-80' : 'left-0'}`}>
        <SkyCanvas />
      </main>

      <Sidebar />
      <ControlPanel />
      <DetailPanel />
      <DiscoveryToast />
      <HelpModal />
      <WelcomeModal />
    </div>
  );
}

export default App;
