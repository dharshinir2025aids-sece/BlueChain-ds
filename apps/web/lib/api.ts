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
 * API base URLs
 */
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export const aiBaseUrl =
  process.env.NEXT_PUBLIC_AI_URL ?? "http://localhost:8000";

export const appMeta = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? APP_NAME,
  tagline: APP_TAGLINE,
} as const;

/**
 * API Error
 */
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

/**
 * Generic API request helper
 */
async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

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
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Unable to reach the API server",
    );
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

/**
 * Authentication API
 */
export const authApi = {
  register: (input: RegisterInput) =>
    request<AuthResult>("/auth/register", {
      method: "POST",
      body: input,
    }),

  login: (input: LoginInput) =>
    request<AuthResult>("/auth/login", {
      method: "POST",
      body: input,
    }),

  me: (token: string) =>
    request<AuthUser>("/auth/me", {
      token,
    }),
};

/**
 * Public Registry Project
 */
export type PublicProject = {
  id: string;
  title: string;
  description: string | null;
  ecosystemType: string;
  status: string;
  areaHa: number | null;
  stateCode: string | null;
  methodology: string | null;
  startDate: string | null;
  createdAt: string;

  organization: {
    id: string;
    name: string;
    type: string;
  };

  _count: {
    plots: number;
    reports: number;
    credits: number;
  };
};

/**
 * Public Registry Project List
 */
export type PublicProjectList = {
  items: PublicProject[];
  total: number;
  page: number;
  limit: number;
};

/**
 * Public Registry Statistics
 */
export type PublicStats = {
  totalProjects: number;
  verifiedProjects: number;
  activeProjects?: number;
  totalCredits: number;
  mintedCredits: number;
  retiredCredits: number;
  totalTco2e: number;
};

/**
 * Public API
 *
 * These endpoints do NOT require authentication.
 */
export const publicApi = {
  /**
   * Get public projects
   *
   * GET /v1/public/projects
   */
  projects: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    ecosystemType?: string;
    stateCode?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) {
      query.set("page", String(params.page));
    }

    if (params?.limit) {
      query.set("limit", String(params.limit));
    }

    if (params?.status) {
      query.set("status", params.status);
    }

    if (params?.ecosystemType) {
      query.set("ecosystemType", params.ecosystemType);
    }

    if (params?.stateCode) {
      query.set("stateCode", params.stateCode);
    }

    if (params?.search) {
      query.set("search", params.search);
    }

    const suffix = query.toString()
      ? `?${query.toString()}`
      : "";

    return request<PublicProjectList>(
      `/public/projects${suffix}`,
    );
  },

  /**
   * Get one public project
   *
   * GET /v1/public/projects/:id
   */
  project: (id: string) =>
    request<PublicProject>(
      `/public/projects/${id}`,
    ),

  /**
   * Get public registry statistics
   *
   * GET /v1/public/stats
   */
  stats: () =>
    request<PublicStats>("/public/stats"),
};