/**
 * Shared domain types for BlueChain MRV.
 * Phase 1: type definitions only — no business logic.
 */

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  NCCR_ADMIN = "NCCR_ADMIN",
  NGO_MANAGER = "NGO_MANAGER",
  FIELD_WORKER = "FIELD_WORKER",
  VERIFIER = "VERIFIER",
  CORPORATE_BUYER = "CORPORATE_BUYER",
  PUBLIC = "PUBLIC",
}

export enum ProjectStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  VERIFIED = "VERIFIED",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  SUSPENDED = "SUSPENDED",
}

export enum EcosystemType {
  MANGROVE = "MANGROVE",
  SEAGRASS = "SEAGRASS",
  SALT_MARSH = "SALT_MARSH",
}

export enum ReportStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_VERIFICATION = "IN_VERIFICATION",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
}

export enum VerificationDecision {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
}

export enum CreditStatus {
  PENDING = "PENDING",
  MINTED = "MINTED",
  TRANSFERRED = "TRANSFERRED",
  RETIRED = "RETIRED",
}

export enum ObservationType {
  BIOMASS = "BIOMASS",
  WATER_QUALITY = "WATER_QUALITY",
  PHOTO_SURVEY = "PHOTO_SURVEY",
  SENSOR_READING = "SENSOR_READING",
  GENERAL = "GENERAL",
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: Record<string, unknown>;
}

export interface HealthStatus {
  service: string;
  status: "ok" | "degraded" | "down";
  version: string;
  timestamp: string;
}

export enum KycStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

/** Authenticated user shape returned by the API (never includes the password hash). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  orgId: string | null;
  walletAddress: string | null;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Roles a user may self-register with from the public registration form. */
export const SELECTABLE_ROLES: Role[] = [
  Role.NCCR_ADMIN,
  Role.NGO_MANAGER,
  Role.FIELD_WORKER,
  Role.VERIFIER,
  Role.CORPORATE_BUYER,
  Role.SUPER_ADMIN,
];

/** Human-friendly labels for roles. */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.NCCR_ADMIN]: "Government (NCCR)",
  [Role.NGO_MANAGER]: "NGO",
  [Role.FIELD_WORKER]: "Field Officer",
  [Role.VERIFIER]: "Verifier",
  [Role.CORPORATE_BUYER]: "Buyer",
  [Role.PUBLIC]: "Public",
};

/** Landing route for each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "/super",
  [Role.NCCR_ADMIN]: "/admin",
  [Role.NGO_MANAGER]: "/ngo",
  [Role.FIELD_WORKER]: "/field",
  [Role.VERIFIER]: "/verifier",
  [Role.CORPORATE_BUYER]: "/buyer",
  [Role.PUBLIC]: "/",
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}

export const APP_NAME = "BlueChain MRV";
export const APP_TAGLINE = "Blue Carbon Registry & MRV";
