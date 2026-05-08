import { useSessionStore } from '@/entities/session';
import { AUTH_CONFIG } from '@/shared/config/auth';
import { authApi } from '../api/auth-api';
import { clearStoredPkceContext, getStoredPkceContext } from './pkce-storage';

/**
 * Validates the OAuth2 callback and exchanges the code for a token.
 * In FSD, this is an "Action" that coordinates between an Entity and an API.
 */
interface CompletePkceFlowOptions {
  redirectUri?: string;
  fallbackUser?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export async function completePkceFlow(
  search: string,
  options?: CompletePkceFlowOptions,
): Promise<void> {
  const searchParams = new URLSearchParams(search);
  const returnedState = searchParams.get('state');
  const oauthError = searchParams.get('error');
  if (oauthError) {
    if (returnedState) {
      clearStoredPkceContext(returnedState);
    }
    const description =
      searchParams.get('error_description') ||
      'Authorization server rejected the request.';
    throw new Error(`${oauthError}: ${description}`);
  }

  // 1. Extract the code from the URL
  const code = searchParams.get('code');
  if (!code) {
    throw new Error('Authorization code is missing in callback URL.');
  }

  // 2. Validate State (Anti-forgery)
  if (!returnedState) {
    throw new Error('OAuth state is missing in callback URL.');
  }

  const { verifier } = getStoredPkceContext(returnedState);

  // 3. Verify we have the PKCE Verifier
  if (!verifier) {
    throw new Error(
      'PKCE verifier was not found. Please restart the sign-in flow.',
    );
  }

  // 4. Exchange the code for the final JWT via Java Backend
  try {
    const tokenResponse = await authApi.exchangeCodeForToken(
      code,
      verifier,
      options?.redirectUri ?? AUTH_CONFIG.redirectUri,
    );

    // 5. Update the Zustand Entity Store
    const { setAuth, user } = useSessionStore.getState();

    setAuth(
      {
        accessToken: tokenResponse.access_token,
        expiresIn: tokenResponse.expires_in,
      },
      user ??
        options?.fallbackUser ?? {
          id: 'placeholder-id',
          email: 'user@example.com',
        },
    );
  } finally {
    // 6. Cleanup sensitive temporary data
    clearStoredPkceContext(returnedState);
  }
}
