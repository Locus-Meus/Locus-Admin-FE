const REDIRECT_URL_KEY = 'redirect_url';

export function storeRedirectUrl(url: string): void {
  sessionStorage.setItem(REDIRECT_URL_KEY, url);
}

export function getStoredRedirectUrl(): string | null {
  return sessionStorage.getItem(REDIRECT_URL_KEY);
}

export function clearStoredRedirectUrl(): void {
  sessionStorage.removeItem(REDIRECT_URL_KEY);
}
