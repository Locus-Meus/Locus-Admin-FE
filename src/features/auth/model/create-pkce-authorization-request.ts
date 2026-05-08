import pkceChallenge from 'pkce-challenge';
import { AUTH_CONFIG, resolveEndpoint } from '@/shared/config/auth';
import { storePkceContext } from './pkce-storage';

const CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function generateState(length = 32): string {
  const values = new Uint8Array(length);
  globalThis.crypto.getRandomValues(values);
  return Array.from(values, (x) => CHARSET[x % CHARSET.length]).join('');
}

interface CreatePkceAuthorizationRequestOptions {
  redirectUri: string;
  prompt?: 'login' | 'none';
}

export async function createPkceAuthorizationRequest(
  options: CreatePkceAuthorizationRequestOptions,
): Promise<{ authUrl: string; state: string }> {
  const state = generateState();
  const challenge = await pkceChallenge(64, 'S256');
  storePkceContext(state, challenge.code_verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: AUTH_CONFIG.clientId,
    redirect_uri: options.redirectUri,
    scope: AUTH_CONFIG.scope || 'openid profile read',
    role: AUTH_CONFIG.role,
    code_challenge: challenge.code_challenge,
    code_challenge_method: 'S256',
    state,
  });

  if (options.prompt) {
    params.set('prompt', options.prompt);
  }

  const query = params.toString().replace(/\+/g, '%20');

  return {
    authUrl: `${resolveEndpoint(AUTH_CONFIG.endpoints.authorize)}?${query}`,
    state,
  };
}
