import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  init as initSDK,
  mockTelegramEnv,
  isTMA,
  retrieveLaunchParams,
  restoreInitData,
  initDataRaw,
} from '@telegram-apps/sdk-react';

/**
 * Sets up a fake Telegram environment so the app is runnable in a plain
 * desktop browser during development (Telegram normally injects this data
 * itself). Without this, @telegram-apps/sdk throws immediately outside
 * the real Telegram client.
 */
async function mockEnvForBrowserDev() {
  if (await isTMA()) return;

  mockTelegramEnv({
    launchParams: {
      tgWebAppThemeParams: {
        bg_color: '#ffffff',
        text_color: '#222222',
        hint_color: '#a8a8a8',
        link_color: '#2aabee',
        button_color: '#2aabee',
        button_text_color: '#ffffff',
        accent_text_color: '#2aabee',
      },
      tgWebAppData: new URLSearchParams([
        ['user', JSON.stringify({ id: 1, first_name: 'Dev', last_name: 'User', username: 'dev', language_code: 'uk' })],
        ['auth_date', String(Math.floor(Date.now() / 1000))],
        ['hash', 'mock-hash-for-local-dev-only'],
        ['signature', 'mock-signature-for-local-dev-only'],
      ]),
      tgWebAppStartParam: 'debug',
      tgWebAppVersion: '8',
      tgWebAppPlatform: 'tdesktop',
    },
  });
}

// Mounting/binding a scope can race with another scope mounting it as a
// side effect (observed with themeParams while mocking the environment for
// browser dev). None of these steps are essential to each other, so each
// runs independently: one failing shouldn't skip the rest.
function attempt(step: () => void) {
  try {
    step();
  } catch (error) {
    console.debug('[telegram] init step skipped:', error);
  }
}

let initPromise: ReturnType<typeof runInit> | null = null;

export function initTelegram() {
  return (initPromise ??= runInit());
}

async function runInit() {
  await mockEnvForBrowserDev();

  attempt(() => initSDK());
  attempt(() => restoreInitData());
  attempt(() => backButton.isSupported() && !backButton.isMounted() && backButton.mount());
  attempt(() => miniApp.mountSync.isAvailable() && !miniApp.isMounted() && miniApp.mountSync());
  attempt(() => themeParams.mountSync.isAvailable() && !themeParams.isMounted() && themeParams.mountSync());

  if (viewport.mount.isAvailable() && !viewport.isMounted() && !viewport.isMounting()) {
    // In a real Telegram client this resolves almost instantly. Outside one
    // (plain browser dev, headless test runners) there's no native bridge to
    // answer the mount request, so the promise never settles — race it
    // against a timeout instead of letting it block the rest of init forever.
    await Promise.race([
      viewport.mount().catch(() => {
        // Falls back to default (non-expanded) viewport dimensions in unsupported hosts.
      }),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  }

  attempt(() => viewport.bindCssVars.isAvailable() && !viewport.isCssVarsBound() && viewport.bindCssVars());
  attempt(() => viewport.expand.isAvailable() && viewport.expand());
  attempt(() => themeParams.bindCssVars.isAvailable() && !themeParams.isCssVarsBound() && themeParams.bindCssVars());
  attempt(() => miniApp.bindCssVars.isAvailable() && !miniApp.isCssVarsBound() && miniApp.bindCssVars());

  return retrieveLaunchParams();
}

/** Raw initData query string, sent as-is to mini_app_api for HMAC validation. */
export function getInitDataRaw(): string {
  const raw = initDataRaw();
  if (!raw) {
    throw new Error('initData is not available yet — call initTelegram() first');
  }
  return raw;
}
