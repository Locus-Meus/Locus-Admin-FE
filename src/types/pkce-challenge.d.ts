declare module 'pkce-challenge' {
  export type PkceMethod = 'S256' | 'plain';

  export interface PkceChallenge {
    code_verifier: string;
    code_challenge: string;
    code_challenge_method: PkceMethod;
  }

  export default function pkceChallenge(
    length?: number,
    method?: PkceMethod,
  ): Promise<PkceChallenge>;

  export function generateChallenge(
    codeVerifier: string,
    method?: PkceMethod,
  ): Promise<string>;

  export function verifyChallenge(
    codeVerifier: string,
    codeChallenge: string,
    method?: PkceMethod,
  ): Promise<boolean>;
}
