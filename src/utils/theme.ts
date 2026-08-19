const THEME_KEY = 'pulse-theme'

export type Theme = 'dark' | 'light'

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function applyTheme(): void {
  setTheme(getTheme())
}