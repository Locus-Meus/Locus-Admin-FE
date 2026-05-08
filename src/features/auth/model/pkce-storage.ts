const PKCE_CONTEXTS_KEY = 'pkce_contexts';
const PKCE_CONTEXT_TTL_MS = 10 * 60 * 1000;

interface PkceContext {
  verifier: string;
  createdAt: number;
}

type PkceContextMap = Record<string, PkceContext>;

function readPkceContexts(): PkceContextMap {
  const rawValue = sessionStorage.getItem(PKCE_CONTEXTS_KEY);
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as PkceContextMap;
    const now = Date.now();

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, context]) =>
          typeof context?.verifier === 'string' &&
          now - context.createdAt <= PKCE_CONTEXT_TTL_MS,
      ),
    );
  } catch {
    sessionStorage.removeItem(PKCE_CONTEXTS_KEY);
    return {};
  }
}

function writePkceContexts(contexts: PkceContextMap): void {
  if (Object.keys(contexts).length === 0) {
    sessionStorage.removeItem(PKCE_CONTEXTS_KEY);
    return;
  }

  sessionStorage.setItem(PKCE_CONTEXTS_KEY, JSON.stringify(contexts));
}

export function storePkceContext(state: string, verifier: string): void {
  const contexts = readPkceContexts();
  contexts[state] = {
    verifier,
    createdAt: Date.now(),
  };
  writePkceContexts(contexts);
}

export function getStoredPkceContext(state: string): {
  verifier: string | null;
} {
  const contexts = readPkceContexts();
  const context = contexts[state];

  return {
    verifier: context?.verifier ?? null,
  };
}

export function clearStoredPkceContext(state?: string): void {
  if (!state) {
    sessionStorage.removeItem(PKCE_CONTEXTS_KEY);
    return;
  }

  const contexts = readPkceContexts();
  delete contexts[state];
  writePkceContexts(contexts);
}
