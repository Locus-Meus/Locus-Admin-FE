import { useSessionStore } from '@/entities/session';
import { AUTH_CONFIG } from '@/shared/config/auth';
import { clearStoredPkceContext } from './pkce-storage';
import { completePkceFlow } from './complete-pkce-flow';
import { createPkceAuthorizationRequest } from './create-pkce-authorization-request';

export const SILENT_AUTH_MESSAGE_TYPE = 'vis:silent-auth-callback';
export const SILENT_REFRESH_LEEWAY_MS = 60_000;
const MIN_TTL_RATIO_BEFORE_REFRESH = 0.5;

const SILENT_AUTH_TIMEOUT_MS = 15_000;

let silentAuthPromise: Promise<void> | null = null;
let scheduledRefreshId: number | null = null;

function clearScheduledRefresh(): void {
  if (scheduledRefreshId !== null) {
    window.clearTimeout(scheduledRefreshId);
    scheduledRefreshId = null;
  }
}

function normalizeSilentAuthError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Silent authentication failed.');
}

function removeIframe(iframe: HTMLIFrameElement | null): void {
  if (iframe?.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

function hasSilentAuthPayload(
  data: unknown,
): data is { type: string; search: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'search' in data &&
    typeof data.type === 'string' &&
    typeof data.search === 'string'
  );
}

async function executeSilentAuthFlow(): Promise<void> {
  const { authUrl, state } = await createPkceAuthorizationRequest({
    redirectUri: AUTH_CONFIG.silentRedirectUri,
    prompt: 'none',
  });

  return new Promise<void>((resolve, reject) => {
    let iframe: HTMLIFrameElement | null = document.createElement('iframe');
    let timeoutId: number | null = null;
    let settled = false;

    const cleanup = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('message', handleMessage);
      removeIframe(iframe);
      iframe = null;
    };

    const fail = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      clearStoredPkceContext(state);
      reject(normalizeSilentAuthError(error));
    };

    const complete = async (search: string) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();

      try {
        await completePkceFlow(search, {
          redirectUri: AUTH_CONFIG.silentRedirectUri,
        });
        resolve();
      } catch (error) {
        reject(normalizeSilentAuthError(error));
      }
    };

    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
        return;
      }

      if (!hasSilentAuthPayload(event.data)) {
        return;
      }

      if (event.data.type !== SILENT_AUTH_MESSAGE_TYPE) {
        return;
      }

      const searchParams = new URLSearchParams(event.data.search);
      if (searchParams.get('state') !== state) {
        return;
      }

      void complete(event.data.search);
    };

    timeoutId = window.setTimeout(() => {
      fail(new Error('Silent authentication timed out.'));
    }, SILENT_AUTH_TIMEOUT_MS);

    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.src = authUrl;

    window.addEventListener('message', handleMessage);
    document.body.appendChild(iframe);
  });
}

export async function authenticateSilently(): Promise<void> {
  if (silentAuthPromise) {
    return silentAuthPromise;
  }

  const { setRefreshing } = useSessionStore.getState();
  setRefreshing(true);

  silentAuthPromise = executeSilentAuthFlow().finally(() => {
    useSessionStore.getState().setRefreshing(false);
    silentAuthPromise = null;
  });

  return silentAuthPromise;
}

export function cancelSilentRefreshSchedule(): void {
  if (typeof window === 'undefined') {
    return;
  }

  clearScheduledRefresh();
}

export function scheduleSilentRefresh(expiresAt: number | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  clearScheduledRefresh();

  if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) {
    return;
  }

  const timeUntilExpiry = expiresAt - Date.now();
  if (timeUntilExpiry <= 0) {
    return;
  }

  // Keep refresh proactive but avoid immediate authorize calls on short-lived tokens.
  const effectiveLeeway = Math.min(
    SILENT_REFRESH_LEEWAY_MS,
    Math.floor(timeUntilExpiry * MIN_TTL_RATIO_BEFORE_REFRESH),
  );
  const delay = timeUntilExpiry - effectiveLeeway;

  scheduledRefreshId = window.setTimeout(() => {
    void authenticateSilently().catch(() => {
      handleAuthFailure();
    });
  }, delay);
}

export function handleAuthFailure(): void {
  cancelSilentRefreshSchedule();
  useSessionStore.getState().logout();

  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    window.location.assign('/');
  }
}
