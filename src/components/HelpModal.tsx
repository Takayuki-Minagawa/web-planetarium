import type { ReactNode } from 'react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../i18n/translations';
import Modal from './ui/Modal';
import { IconHand, IconConstellation, IconClock, IconSliders, IconHelp, Sparkle } from './ui/Icons';

export default function HelpModal() {
  const helpOpen = useAppStore((s) => s.helpOpen);
  const setHelpOpen = useAppStore((s) => s.setHelpOpen);
  const setWelcomeOpen = useAppStore((s) => s.setWelcomeOpen);
  const lang = useAppStore((s) => s.lang);
  if (!helpOpen) return null;

  const sections: { title: string; icon: ReactNode; items: string[] }[] = [
    {
      title: t('help.section.basic', lang),
      icon: <IconHand size={18} />,
      items: [
        t('help.basic.drag', lang),
        t('help.basic.scroll', lang),
        t('help.basic.click', lang),
        t('help.basic.zoom', lang),
      ],
    },
    {
      title: t('help.section.sidebar', lang),
      icon: <IconConstellation size={18} />,
      items: [
        t('help.sidebar.list', lang),
        t('help.sidebar.search', lang),
        t('help.sidebar.visible', lang),
        t('help.sidebar.journal', lang),
      ],
    },
    {
      title: t('help.section.controls', lang),
      icon: <IconClock size={18} />,
      items: [
        t('help.controls.datetime', lang),
        t('help.display.timelapse', lang),
        t('help.controls.location', lang),
        t('help.controls.reset', lang),
      ],
    },
    {
      title: t('help.section.display', lang),
      icon: <IconSliders size={18} />,
      items: [
        t('help.display.toggle', lang),
        t('help.display.brightness', lang),
      ],
    },
    {
      title: t('help.section.keyboard', lang),
      icon: <span className="text-[11px] font-bold">⌨</span>,
      items: [
        t('help.keyboard.arrows', lang),
        t('help.keyboard.zoom', lang),
      ],
    },
  ];

  const close = () => setHelpOpen(false);

  return (
    <Modal onClose={close} labelledBy="help-title" className="sm:max-w-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 border-b border-line bg-surface-solid">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-soft text-accent">
          <IconHelp size={18} />
        </span>
        <h2 id="help-title" className="text-lg font-bold">{t('help.title', lang)}</h2>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-line bg-raised p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-accent">
              {section.icon}
              {section.title}
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed flex gap-2 text-ink/85">
                  <Sparkle size={8} className="shrink-0 mt-[7px] text-faint" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 p-4 border-t border-line bg-surface-solid grid grid-cols-2 gap-2">
        <button
          onClick={() => { close(); setWelcomeOpen(true); }}
          className="py-2.5 rounded-xl text-sm font-medium bg-raised border border-line text-muted hover:text-ink hover:bg-hover transition-colors"
        >
          {t('welcome.reopen', lang)}
        </button>
        <button
          data-autofocus
          onClick={close}
          className="py-2.5 rounded-xl text-sm font-semibold bg-accent text-accent-ink hover:brightness-110 transition-all"
        >
          {t('help.close', lang)}
        </button>
      </div>
    </Modal>
  );
}
