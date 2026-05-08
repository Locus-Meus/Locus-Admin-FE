import { AUTH_CONFIG } from '@/shared/config/auth';
import { createPkceAuthorizationRequest } from './create-pkce-authorization-request';

export const navigateToLogin = async () => {
  try {
    const { authUrl } = await createPkceAuthorizationRequest({
      redirectUri: AUTH_CONFIG.redirectUri,
    });
    window.location.href = authUrl;
  } catch (error) {
    console.error('Login Flow Error:', error);
    throw new Error('Authentication failed. Please check your credentials.');
  }
};
