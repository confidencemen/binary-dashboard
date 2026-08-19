import type { ThemeMode } from '../theme';

interface HeaderBarProps {
  clock: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export default function HeaderBar({ clock, theme, onToggleTheme }: HeaderBarProps) {
  return (
    <header className="header-bar">
      <div className="header-bar__glow" />
      <div className="header-bar__left">
        <div className="header-bar__logo" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="34" height="34">
            <defs>
              <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4aa3ff" />
                <stop offset="100%" stopColor="#1677ff" />
              </linearGradient>
            </defs>
            <path
              d="M24 4 L40 10 V22 C40 33 33 41 24 44 C15 41 8 33 8 22 V10 Z"
              fill="url(#shield-grad)"
              opacity="0.95"
            />
            <path
              d="M18 24 L22.5 28.5 L31 18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1 className="header-bar__title">鸿蒙二进制安全治理看板：深度分析二进制安全现状，精准全面消减安全风险</h1>
          <p className="header-bar__subtitle">HarmonyOS Binary Security Governance Dashboard</p>
        </div>
      </div>
      <div className="header-bar__right">
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? '切换为暗色风格' : '切换为亮色风格'}
        >
          {theme === 'light' ? '暗色风格' : '亮色风格'}
        </button>
        <span className="header-bar__chip">安全态势可视化</span>
        <time className="header-bar__clock">{clock}</time>
      </div>
    </header>
  );
}
