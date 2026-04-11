import { useAppStore } from '../store/useAppStore';
import { t } from '../i18n/translations';

export default function HelpModal() {
  const { helpOpen, setHelpOpen, lang, theme } = useAppStore();
  if (!helpOpen) return null;

  const sections = [
    {
      title: t('help.section.basic', lang),
      items: [
        t('help.basic.drag', lang),
        t('help.basic.scroll', lang),
        t('help.basic.click', lang),
        t('help.basic.zoom', lang),
      ],
    },
    {
      title: t('help.section.sidebar', lang),
      items: [
        t('help.sidebar.list', lang),
        t('help.sidebar.search', lang),
        t('help.sidebar.visible', lang),
      ],
    },
    {
      title: t('help.section.controls', lang),
      items: [
        t('help.controls.datetime', lang),
        t('help.controls.location', lang),
        t('help.controls.reset', lang),
      ],
    },
    {
      title: t('help.section.display', lang),
      items: [
        t('help.display.toggle', lang),
        t('help.display.brightness', lang),
      ],
    },
  ];

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => setHelpOpen(false)} />
      <div className={`relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border shadow-2xl ${
        isDark
          ? 'bg-gray-900 border-gray-700/50 text-white'
          : 'bg-white border-gray-200 text-gray-900'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${
          isDark ? 'bg-gray-900 border-gray-700/30' : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-lg font-bold">{t('help.title', lang)}</h2>
          <button
            onClick={() => setHelpOpen(false)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                {section.title}
              </h3>
              <ul className="space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className={`text-sm leading-relaxed flex gap-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="shrink-0 mt-1">&#8226;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 p-4 border-t ${
          isDark ? 'bg-gray-900 border-gray-700/30' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={() => setHelpOpen(false)}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-300'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
            }`}
          >
            {t('help.close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
