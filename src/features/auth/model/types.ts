export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface CsrfToken {
  token: string;
  headerName: string;
  parameterName: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone?: string; // Optional field
  language: string; // For i18n sync with Java
}

export interface SignInPayload {
  username: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
}
