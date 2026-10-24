import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconClose = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>;
export const IconMenu = (p: IconProps) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Icon>;
export const IconSearch = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></Icon>;
export const IconSun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Icon>
);
export const IconMoon = (p: IconProps) => <Icon {...p}><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></Icon>;
export const IconHelp = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.6 2.6 0 015 .9c0 1.7-2.5 2.2-2.5 3.6M12 17h.01" /></Icon>
);
export const IconPin = (p: IconProps) => (
  <Icon {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></Icon>
);
export const IconSliders = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
);
export const IconPlus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const IconMinus = (p: IconProps) => <Icon {...p}><path d="M5 12h14" /></Icon>;
export const IconPlay = (p: IconProps) => <Icon {...p}><path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" /></Icon>;
export const IconPause = (p: IconProps) => (
  <Icon {...p}><rect x="7" y="5.5" width="3.4" height="13" rx="1" fill="currentColor" stroke="none" /><rect x="13.6" y="5.5" width="3.4" height="13" rx="1" fill="currentColor" stroke="none" /></Icon>
);
export const IconBack = (p: IconProps) => <Icon {...p}><path d="M11 7l-5 5 5 5M18 7l-5 5 5 5" /></Icon>;
export const IconForward = (p: IconProps) => <Icon {...p}><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></Icon>;
export const IconClock = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>;
export const IconCompass = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></Icon>
);
export const IconLocate = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" /></Icon>
);
export const IconChevronDown = (p: IconProps) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
export const IconCheck = (p: IconProps) => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>;
export const IconHand = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 13V5.5a1.5 1.5 0 013 0V11M11 10.5V4a1.5 1.5 0 013 0v6.5M14 10.5V5.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-.5a6 6 0 01-5-2.7L3 15.5a1.6 1.6 0 012.5-2L8 15.5" />
  </Icon>
);
export const IconTap = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="6" opacity="0.6" /><circle cx="12" cy="12" r="9.5" opacity="0.3" /></Icon>
);
export const IconBook = (p: IconProps) => (
  <Icon {...p}><path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5zM20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z" /></Icon>
);

// 四方向にきらめく星形（ブランドマーク／発見の象徴）
export function Sparkle({ size = 16, className, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      <path
        d="M12 1.5c.5 4.9 2.1 8.4 10.5 10.5C14.1 14.1 12.5 17.6 12 22.5 11.5 17.6 9.9 14.1 1.5 12 9.9 9.9 11.5 6.4 12 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// タブ用アイコン
export const IconConstellation = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 17l5-6 5 3 6-8" strokeWidth={1.4} opacity="0.7" />
    <circle cx="4" cy="17" r="1.6" fill="currentColor" />
    <circle cx="9" cy="11" r="1.6" fill="currentColor" />
    <circle cx="14" cy="14" r="1.6" fill="currentColor" />
    <circle cx="20" cy="6" r="1.6" fill="currentColor" />
  </Icon>
);
export const IconStar = (p: IconProps) => (
  <Icon {...p}><path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8L8 13.5l-4.3-4 5.8-.7z" /></Icon>
);
export const IconPlanet = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="5" /><path d="M3.5 15.5c-1.3 2 7.2.5 12.6-3.6S21.8 4.6 19.5 6" /></Icon>
);
export const IconEye = (p: IconProps) => (
  <Icon {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></Icon>
);
