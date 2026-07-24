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

export const APP_NAME = "BlueChain MRV";
export const APP_TAGLINE = "Blue Carbon Registry & MRV";
