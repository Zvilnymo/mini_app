import { createRoot } from 'react-dom/client';
import { AppRoot } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';
import App from './App.tsx';
import { initTelegram } from './telegram/init';

// No <StrictMode>: it double-invokes effects in dev, and telegram-ui's
// AppRoot mounts themeParams as a side effect without guarding against
// being called twice, which throws. Doesn't affect the production build.
initTelegram()
  .catch((error) => {
    console.error('Failed to init Telegram environment', error);
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <AppRoot>
        <App />
      </AppRoot>,
    );
  });
