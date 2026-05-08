import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useSessionStore } from '@/entities/session';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthHandling?: boolean;
  }

  interface InternalAxiosRequestConfig {
    skipAuthHandling?: boolean;
    _authRetry?: boolean;
  }
}

type RecoverUnauthorizedRequest = () => Promise<boolean>;
type AuthFailureHandler = () => void;

let recoverUnauthorizedRequest: RecoverUnauthorizedRequest | null = null;
let authFailureHandler: AuthFailureHandler | null = null;

export function configureApiAuthHandlers(options: {
  recoverUnauthorizedRequest?: RecoverUnauthorizedRequest;
  onAuthFailure?: AuthFailureHandler;
}): void {
  recoverUnauthorizedRequest = options.recoverUnauthorizedRequest ?? null;
  authFailureHandler = options.onAuthFailure ?? null;
}

export class BaseApiClient {
  protected axios: AxiosInstance;

  constructor(baseURL: string = '') {
    this.axios = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Inject Token
    this.axios.interceptors.request.use((config) => {
      if (config.skipAuthHandling) {
        return config;
      }

      const token = useSessionStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle Auth Errors
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as
          | InternalAxiosRequestConfig
          | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest.skipAuthHandling
        ) {
          if (!originalRequest._authRetry && recoverUnauthorizedRequest) {
            originalRequest._authRetry = true;

            try {
              const recovered = await recoverUnauthorizedRequest();
              if (recovered) {
                return this.axios.request(originalRequest);
              }
            } catch {
              // Fall through to auth failure handling below.
            }
          }

          if (authFailureHandler) {
            authFailureHandler();
          } else {
            useSessionStore.getState().logout();
            window.location.href = '/';
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Java-like helper methods
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.axios.get<T>(url, config);
    return data;
  }

  protected async post<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.axios.post<T>(url, body, config);
    return data;
  }
}
