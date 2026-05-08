import { BaseApiClient } from '@/shared/api/base-api-client';
import { AUTH_CONFIG } from '@/shared/config/auth';
import type {
  CsrfToken,
  AuthTokenResponse,
  ResetPasswordPayload,
} from '../model/types';

class AuthApi extends BaseApiClient {
  constructor() {
    super(AUTH_CONFIG.issuer || '/api');
  }

  public async heartbeat(): Promise<void> {
    return this.get<void>('/v1/api/heartbeat');
  }

  public async getCsrfToken(): Promise<CsrfToken> {
    return this.get<CsrfToken>(AUTH_CONFIG.endpoints.csrf);
  }

  public async requestPasswordReset(
    payload: ResetPasswordPayload,
    csrf: CsrfToken,
  ): Promise<void> {
    return this.post(AUTH_CONFIG.endpoints.resetPassword, payload, {
      headers: {
        [csrf.headerName]: csrf.token,
      },
      skipAuthHandling: true,
    });
  }

  public async verifyEmail(token: string): Promise<void> {
    const params = new URLSearchParams();
    params.set('token', token);

    return this.post<void>(
      `${AUTH_CONFIG.endpoints.verifyEmail}?${params.toString()}`,
      undefined,
      {
        skipAuthHandling: true,
      },
    );
  }

  public async exchangeCodeForToken(
    code: string,
    verifier: string,
    redirectUri: string = AUTH_CONFIG.redirectUri,
  ): Promise<AuthTokenResponse> {
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('code', code);
    params.set('code_verifier', verifier);
    params.set('redirect_uri', redirectUri);
    params.set('client_id', AUTH_CONFIG.clientId);
    // params.set('client_secret', AUTH_CONFIG.clientSecret);

    return this.post<AuthTokenResponse>(AUTH_CONFIG.endpoints.token, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      skipAuthHandling: true,
    });
  }

  public async logout(csrf: CsrfToken): Promise<void> {
    const params = new URLSearchParams();
    params.set(csrf.parameterName, csrf.token);

    return this.post<void>(AUTH_CONFIG.endpoints.logout, params, {
      headers: {
        [csrf.headerName]: csrf.token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      skipAuthHandling: true,
    });
  }
}

export const authApi = new AuthApi();
