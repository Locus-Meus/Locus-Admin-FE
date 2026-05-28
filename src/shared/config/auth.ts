function getDefaultRedirectUri(path: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:5175';

  return `${origin}${path}`;
}

export const AUTH_CONFIG = {
  issuer: import.meta.env.VITE_AUTH_ISSUER || 'http://localhost:8888',
  clientId: 'admin-client',
  clientSecret: import.meta.env.VITE_AUTH_CLIENT_SECRET || 'secret',
  scope: import.meta.env.VITE_AUTH_SCOPE || 'openid profile read write',
  role: import.meta.env.VITE_AUTH_ROLE || 'admin',
  redirectUri:
    import.meta.env.VITE_AUTH_REDIRECT_URI ||
    getDefaultRedirectUri('/callback'),
  silentRedirectUri:
    import.meta.env.VITE_AUTH_SILENT_REDIRECT_URI ||
    getDefaultRedirectUri('/silent-callback'),

  endpoints: {
    // Session & Security
    csrf: import.meta.env.VITE_AUTH_CSRF_ENDPOINT || 'api/csrf-token',
    signIn: import.meta.env.VITE_AUTH_SIGN_IN_ENDPOINT || 'api/sign-in',
    verifyEmail:
      import.meta.env.VITE_AUTH_VERIFY_EMAIL_ENDPOINT ||
      'api/emails/verify',

    // OAuth2 / PKCE Flow
    authorize:
      import.meta.env.VITE_AUTH_AUTHORIZE_ENDPOINT || 'oauth2/authorize',
    token: import.meta.env.VITE_AUTH_TOKEN_ENDPOINT || 'oauth2/token',

    // Management
    logout: 'api/logout',
    signUp:
      import.meta.env.VITE_AUTH_SIGN_UP_ENDPOINT ||
      'http://localhost:8888/sign-up',
    resetPassword: 'api/reset-password',
  },
} as const;

/**
 * Utility to resolve an endpoint.
 * If the endpoint is relative, it appends the issuer.
 */
export function resolveEndpoint(endpoint: string): string {
  if (endpoint.startsWith('http')) return endpoint;

  const base = AUTH_CONFIG.issuer.endsWith('/')
    ? AUTH_CONFIG.issuer.slice(0, -1)
    : AUTH_CONFIG.issuer;

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${base}${path}`;
}
