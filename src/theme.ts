import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'dashboard-theme';

export function readStoredTheme(): ThemeMode {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function persistTheme(themeMode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  } catch {
    /* ignore quota / private mode */
  }
  document.documentElement.setAttribute('data-theme', themeMode);
}

export const lightAntdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#0b63e5',
    colorBgBase: '#f3f6fb',
    colorBorder: '#c5d4e8',
    colorText: '#102033',
    borderRadius: 10,
    fontSize: 14,
  },
};

export const darkAntdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#3aa0ff',
    colorBgBase: '#07111d',
    colorBorder: 'rgba(90, 168, 255, 0.28)',
    colorText: '#e8f2ff',
    borderRadius: 10,
    fontSize: 14,
  },
};
