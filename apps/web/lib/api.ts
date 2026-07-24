import {
  APP_NAME,
  APP_TAGLINE,
  type ApiResponse,
  type AuthResult,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "@bluechain/shared";

/**
 * Thin client helpers for API URLs.
 * Business clients arrive in later phases.
 */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export const aiBaseUrl =
  process.env.NEXT_PUBLIC_AI_URL ?? "http://localhost:8000";

export const appMeta = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? APP_NAME,
  tagline: APP_TAGLINE,
} as const;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Unable to reach the API server");
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.success) {
    throw new ApiError(
      res.status,
      payload?.error?.code ?? "REQUEST_FAILED",
      payload?.error?.message ?? "Request failed",
    );
  }

  return payload.data as T;
}

export const authApi = {
  register: (input: RegisterInput) =>
    request<AuthResult>("/auth/register", { method: "POST", body: input }),
  login: (input: LoginInput) =>
    request<AuthResult>("/auth/login", { method: "POST", body: input }),
  me: (token: string) => request<AuthUser>("/auth/me", { token }),
};
