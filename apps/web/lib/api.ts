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
  reports?: Array<{
    id: string;
    periodStart: string | null;
    periodEnd: string | null;
    status: string;
    ipfsCid?: string | null;
    contentHash?: string | null;
  }>;
  credits?: Array<{
    id: string;
    amounttCO2e: number;
    vintageYear?: number | null;
    status?: string | null;
    tokenId?: string | null;
    txMint?: string | null;
  }>;
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

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED API CLIENTS
// All functions below require a JWT token obtained from useAuth().token
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared paginated list wrapper ───────────────────────────────────────────

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Project types ────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  orgId: string;
  title: string;
  description: string | null;
  ecosystemType: string;
  status: string;
  methodology: string | null;
  areaHa: number;
  stateCode: string | null;
  startDate: string | null;
  createdAt: string;
  updatedAt: string;
  organization: { id: string; name: string; type: string };
  _count: { plots: number; reports: number; credits: number };
}

export interface CreateProjectInput {
  title: string;
  orgId: string;
  ecosystemType: string;
  description?: string;
  methodology?: string;
  areaHa?: number;
  startDate?: string;
  stateCode?: string;
}

/**
 * Authenticated project API — wraps /v1/projects
 */
export const projectsApi = {
  list: (
    token: string,
    params?: {
      status?: string;
      ecosystemType?: string;
      orgId?: string;
      stateCode?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.ecosystemType) q.set("ecosystemType", params.ecosystemType);
    if (params?.orgId) q.set("orgId", params.orgId);
    if (params?.stateCode) q.set("stateCode", params.stateCode);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<PaginatedList<Project>>(`/projects${suffix}`, { token });
  },

  get: (token: string, id: string) =>
    request<Project>(`/projects/${id}`, { token }),

  create: (token: string, body: CreateProjectInput) =>
    request<Project>("/projects", { method: "POST", body, token }),

  update: (token: string, id: string, body: Partial<CreateProjectInput> & { status?: string }) =>
    request<Project>(`/projects/${id}`, { method: "PUT", body, token }),

  delete: (token: string, id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE", token }),
};

// ─── Monitoring report types ──────────────────────────────────────────────────

export interface MonitoringReport {
  id: string;
  projectId: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  summaryJson: Record<string, unknown> | null;
  ipfsCid: string | null;
  contentHash: string | null;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  project: { id: string; title: string; orgId: string };
  submitter: { id: string; name: string; email: string };
  _count: { media: number };
}

export interface CreateReportInput {
  projectId: string;
  periodStart: string;
  periodEnd: string;
  summaryJson?: Record<string, unknown>;
  ipfsCid?: string;
  contentHash?: string;
}

/**
 * Authenticated monitoring-report API — wraps /v1/monitoring-reports
 */
export const reportsApi = {
  list: (
    token: string,
    params?: {
      projectId?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const q = new URLSearchParams();
    if (params?.projectId) q.set("projectId", params.projectId);
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<PaginatedList<MonitoringReport>>(
      `/monitoring-reports${suffix}`,
      { token },
    );
  },

  get: (token: string, id: string) =>
    request<MonitoringReport>(`/monitoring-reports/${id}`, { token }),

  create: (token: string, body: CreateReportInput) =>
    request<MonitoringReport>("/monitoring-reports", {
      method: "POST",
      body,
      token,
    }),

  update: (token: string, id: string, body: { status?: string; periodStart?: string; periodEnd?: string; summaryJson?: Record<string, unknown>; ipfsCid?: string; contentHash?: string }) =>
    request<MonitoringReport>(`/monitoring-reports/${id}`, {
      method: "PUT",
      body,
      token,
    }),

  delete: (token: string, id: string) =>
    request<void>(`/monitoring-reports/${id}`, { method: "DELETE", token }),
};

// ─── Carbon credit types ──────────────────────────────────────────────────────

export interface CarbonCredit {
  id: string;
  projectId: string;
  tokenId: string | null;
  amounttCO2e: number;
  vintageYear: number;
  status: string;
  ownerUserId: string | null;
  txMint: string | null;
  txRetire: string | null;
  ipfsCid: string | null;
  createdAt: string;
  updatedAt: string;
  project: { id: string; title: string; orgId: string };
  owner: { id: string; name: string; email: string } | null;
  _count: { transfers: number };
}

/**
 * Authenticated credits API — wraps /v1/blockchain/credits
 */
export const creditsApi = {
  list: (
    token: string,
    params?: {
      projectId?: string;
      status?: string;
      ownerUserId?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const q = new URLSearchParams();
    if (params?.projectId) q.set("projectId", params.projectId);
    if (params?.status) q.set("status", params.status);
    if (params?.ownerUserId) q.set("ownerUserId", params.ownerUserId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<PaginatedList<CarbonCredit>>(
      `/blockchain/credits${suffix}`,
      { token },
    );
  },

  get: (token: string, id: string) =>
    request<CarbonCredit>(`/blockchain/credits/${id}`, { token }),

  mint: (
    token: string,
    body: {
      projectId: string;
      amounttCO2e: number;
      vintageYear: number;
      tokenId?: string;
      txMint?: string;
      ipfsCid?: string;
    },
  ) =>
    request<CarbonCredit>("/blockchain/credits", {
      method: "POST",
      body,
      token,
    }),

  retire: (
    token: string,
    id: string,
    body: { reason?: string; txHash?: string },
  ) =>
    request<unknown>(`/blockchain/credits/${id}/retire`, {
      method: "POST",
      body,
      token,
    }),
};

// ─── Marketplace types ────────────────────────────────────────────────────────

export interface MarketplaceListing {
  id: string;
  creditId: string;
  sellerId: string;
  pricePerTonne: number;
  notes: string | null;
  status: "ACTIVE" | "CANCELLED" | "SOLD";
  createdAt: string;
  updatedAt: string;
  credit: {
    id: string;
    amounttCO2e: number;
    vintageYear: number;
    status: string;
    tokenId: string | null;
    ipfsCid: string | null;
    project: { id: string; title: string; ecosystemType: string; orgId: string };
  };
  seller: { id: string; name: string; email: string };
}

export interface PurchaseResult {
  listing: MarketplaceListing;
  transfer: {
    id: string;
    creditId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    createdAt: string;
  };
}

/**
 * Authenticated marketplace API — wraps /v1/marketplace
 */
export const marketplaceApi = {
  listListings: (
    token: string,
    params?: {
      ecosystemType?: string;
      vintageYear?: number;
      minPrice?: number;
      maxPrice?: number;
      projectId?: string;
      page?: number;
      limit?: number;
    },
  ) => {
    const q = new URLSearchParams();
    if (params?.ecosystemType) q.set("ecosystemType", params.ecosystemType);
    if (params?.vintageYear) q.set("vintageYear", String(params.vintageYear));
    if (params?.minPrice) q.set("minPrice", String(params.minPrice));
    if (params?.maxPrice) q.set("maxPrice", String(params.maxPrice));
    if (params?.projectId) q.set("projectId", params.projectId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<PaginatedList<MarketplaceListing>>(
      `/marketplace/listings${suffix}`,
      { token },
    );
  },

  getListing: (token: string, id: string) =>
    request<MarketplaceListing>(`/marketplace/listings/${id}`, { token }),

  purchase: (token: string, id: string, body: { quantity: number; notes?: string }) =>
    request<PurchaseResult>(`/marketplace/listings/${id}/purchase`, {
      method: "POST",
      body,
      token,
    }),

  cancelListing: (token: string, id: string) =>
    request<void>(`/marketplace/listings/${id}`, {
      method: "DELETE",
      token,
    }),
};

// ─── Verification package types ───────────────────────────────────────────────

export interface VerificationPackage {
  id: string;
  reportId: string;
  verifierId: string | null;
  status: string;
  checklistJson: Record<string, unknown> | null;
  decision: string | null;
  comments: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  report: {
    id: string;
    projectId: string;
    periodStart: string;
    periodEnd: string;
    status: string;
    project: { id: string; title: string; orgId: string };
    submitter: { id: string; name: string; email: string };
  };
  verifier: { id: string; name: string; email: string } | null;
}

/**
 * Verification API — wraps /v1/verification
 */
export const verificationApi = {
  list: (
    token: string,
    params?: { status?: string; verifierId?: string; page?: number; limit?: number },
  ) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.verifierId) q.set("verifierId", params.verifierId);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request<PaginatedList<VerificationPackage>>(
      `/verification${suffix}`,
      { token },
    );
  },

  get: (token: string, id: string) =>
    request<VerificationPackage>(`/verification/${id}`, { token }),

  decide: (
    token: string,
    id: string,
    body: { decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED"; comments?: string },
  ) =>
    request<VerificationPackage>(`/verification/${id}/decide`, {
      method: "POST",
      body,
      token,
    }),
};
