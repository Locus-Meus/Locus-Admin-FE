import axios from 'axios';

export interface ApiViolation {
  field: string;
  message: string;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Legacy Spring error payload compatibility. */
  message?: string;
  instance?: string;
  violations?: ApiViolation[];
}

export interface NormalizedApiError {
  message: string;
  status?: number;
  problem?: ApiProblem;
  violations: ApiViolation[];
  cause: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseViolations = (value: unknown): ApiViolation[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (violation): violation is ApiViolation =>
      isRecord(violation) &&
      typeof violation.field === 'string' &&
      typeof violation.message === 'string',
  );
};

const parseProblem = (value: unknown): ApiProblem | undefined => {
  if (!isRecord(value)) return undefined;

  const problem: ApiProblem = {};
  for (const key of ['type', 'title', 'detail', 'instance', 'message'] as const) {
    if (typeof value[key] === 'string') problem[key] = value[key];
  }
  if (typeof value.status === 'number') problem.status = value.status;

  const violations = parseViolations(value.violations);
  if (violations.length > 0) problem.violations = violations;

  return Object.keys(problem).length > 0 ? problem : undefined;
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
  const problem = parseProblem(responseData);
  const status = axios.isAxiosError(error) ? error.response?.status : problem?.status;
  const message =
    problem?.detail ||
    problem?.message ||
    problem?.title ||
    (error instanceof Error ? error.message : 'Unexpected request error');

  return {
    message,
    status,
    problem,
    violations: problem?.violations ?? [],
    cause: error,
  };
}

/**
 * Shared React Query error callback. Consumers can still provide local onError
 * handlers; this callback only normalizes and reports unhandled API failures.
 */
export function handleApiError(error: unknown, source: 'query' | 'mutation'): void {
  const normalized = normalizeApiError(error);

  if (normalized.status === 401) return;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('api-error', { detail: { ...normalized, source } }),
    );
  }

  console.error(`[${source}] API request failed`, normalized);
}
