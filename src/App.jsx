import { useCallback, useEffect, useMemo, useState } from 'react';
import Home from './pages/Home';
import ToastStack from './components/ToastStack';

const THEME_STORAGE_KEY = 'page-pulse-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const notify = useCallback((tone, title, message) => {
    const id = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setToasts((currentToasts) => [...currentToasts, { id, tone, title, message }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, 4200);
  }, [dismissToast]);

  const appProps = useMemo(
    () => ({
      theme,
      onToggleTheme: toggleTheme,
      notify,
    }),
    [theme, toggleTheme, notify],
  );

  return (
    <div className="app-shell">
      <Home {...appProps} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
