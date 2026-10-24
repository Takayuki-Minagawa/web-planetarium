import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { DISCOVERY_IDS, DISCOVERY_TOTAL } from '../utils/bodies';
import { t, localizedName, type TranslationKey } from '../i18n/translations';
import { Sparkle } from './ui/Icons';

const ALL_IDS = new Set(Object.values(DISCOVERY_IDS).flat());

// 初めて見つけた天体を祝う小さな通知
export default function DiscoveryToast() {
  const { toast, dismissToast, discovered, lang } = useAppStore(useShallow((s) => ({
    toast: s.toast,
    dismissToast: s.dismissToast,
    discovered: s.discovered,
    lang: s.lang,
  })));

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, toast.completed ? 5200 : 3200);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  const found = discovered.filter((id) => ALL_IDS.has(id)).length;

  return (
    <div
      className="pointer-events-none fixed z-[60] flex justify-center px-4 inset-x-0 bottom-[calc(58dvh+0.75rem)] md:inset-x-auto md:left-4 md:bottom-4 md:px-0 md:w-72"
      aria-live="polite"
      role="status"
    >
      {toast && (
        <div
          key={toast.key}
          className={`pointer-events-auto panel bg-surface-solid rounded-2xl pl-2 pr-4 py-2 flex items-center gap-3 animate-rise-in max-w-sm w-full ${
            toast.completed ? 'border-accent/60' : ''
          }`}
          onClick={dismissToast}
        >
          <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent-soft text-accent shrink-0">
            <Sparkle size={20} className="animate-pop" />
            <Sparkle size={8} className="absolute top-1 right-1 animate-twinkle" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-accent">
              {toast.completed ? t(`discover.complete.${toast.completed}` as TranslationKey, lang) : t('discover.new', lang)}
            </p>
            <p className="text-sm font-bold text-ink truncate">{localizedName(toast.nameJa, toast.nameEn, lang)}</p>
          </div>
          <div className="ml-1 flex flex-col items-end gap-1 shrink-0">
            <span className="text-[11px] text-muted tabular">{found} / {DISCOVERY_TOTAL}</span>
            <span className="w-16 h-1 rounded-full bg-raised overflow-hidden">
              <span className="block h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${(found / DISCOVERY_TOTAL) * 100}%` }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
