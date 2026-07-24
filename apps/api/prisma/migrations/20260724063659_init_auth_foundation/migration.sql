-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'NCCR_ADMIN', 'NGO_MANAGER', 'FIELD_WORKER', 'VERIFIER', 'CORPORATE_BUYER', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ACTIVE', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EcosystemType" AS ENUM ('MANGROVE', 'SEAGRASS', 'SALT_MARSH');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_VERIFICATION', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "VerificationDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('PENDING', 'MINTED', 'TRANSFERRED', 'RETIRED');

-- CreateEnum
CREATE TYPE "ObservationType" AS ENUM ('BIOMASS', 'WATER_QUALITY', 'PHOTO_SURVEY', 'SENSOR_READING', 'GENERAL');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('NGO', 'GOV', 'CORP', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NONE', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FIELD_WORKER',
    "orgId" TEXT,
    "walletAddress" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "registrationNo" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ecosystemType" "EcosystemType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "methodology" TEXT,
    "areaHa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "boundaryGeoJson" JSONB,
    "startDate" TIMESTAMP(3),
    "stateCode" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "centroidLat" DOUBLE PRECISION,
    "centroidLng" DOUBLE PRECISION,
    "areaHa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "geometryGeoJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "type" "ObservationType" NOT NULL DEFAULT 'GENERAL',
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metricsJson" JSONB,
    "notes" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "aiScore" DOUBLE PRECISION,
    "aiFlagsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "observationId" TEXT,
    "reportId" TEXT,
    "cid" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" TEXT,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "summaryJson" JSONB,
    "ipfsCid" TEXT,
    "contentHash" TEXT,
    "submittedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoringReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationPackage" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "verifierId" TEXT,
    "status" "VerificationDecision" NOT NULL DEFAULT 'PENDING',
    "checklistJson" JSONB,
    "decision" "VerificationDecision",
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarbonCredit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tokenId" TEXT,
    "amounttCO2e" DOUBLE PRECISION NOT NULL,
    "vintageYear" INTEGER NOT NULL,
    "status" "CreditStatus" NOT NULL DEFAULT 'PENDING',
    "ownerUserId" TEXT,
    "txMint" TEXT,
    "txRetire" TEXT,
    "ipfsCid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarbonCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainAnchor" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "ipfsCid" TEXT,
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "network" TEXT NOT NULL DEFAULT 'polygon-amoy',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChainAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransfer" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "txHash" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retirement" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "reason" TEXT,
    "certificateId" TEXT NOT NULL,
    "txHash" TEXT,
    "retiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Retirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payloadJson" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_orgId_idx" ON "User"("orgId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_orgId_idx" ON "Project"("orgId");

-- CreateIndex
CREATE INDEX "Project_ecosystemType_idx" ON "Project"("ecosystemType");

-- CreateIndex
CREATE INDEX "Project_stateCode_idx" ON "Project"("stateCode");

-- CreateIndex
CREATE INDEX "Plot_projectId_idx" ON "Plot"("projectId");

-- CreateIndex
CREATE INDEX "Observation_plotId_idx" ON "Observation"("plotId");

-- CreateIndex
CREATE INDEX "Observation_workerId_idx" ON "Observation"("workerId");

-- CreateIndex
CREATE INDEX "MediaAsset_observationId_idx" ON "MediaAsset"("observationId");

-- CreateIndex
CREATE INDEX "MediaAsset_reportId_idx" ON "MediaAsset"("reportId");

-- CreateIndex
CREATE INDEX "MediaAsset_cid_idx" ON "MediaAsset"("cid");

-- CreateIndex
CREATE INDEX "MonitoringReport_projectId_idx" ON "MonitoringReport"("projectId");

-- CreateIndex
CREATE INDEX "MonitoringReport_status_idx" ON "MonitoringReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationPackage_reportId_key" ON "VerificationPackage"("reportId");

-- CreateIndex
CREATE INDEX "VerificationPackage_status_idx" ON "VerificationPackage"("status");

-- CreateIndex
CREATE INDEX "VerificationPackage_verifierId_idx" ON "VerificationPackage"("verifierId");

-- CreateIndex
CREATE UNIQUE INDEX "CarbonCredit_tokenId_key" ON "CarbonCredit"("tokenId");

-- CreateIndex
CREATE INDEX "CarbonCredit_projectId_idx" ON "CarbonCredit"("projectId");

-- CreateIndex
CREATE INDEX "CarbonCredit_status_idx" ON "CarbonCredit"("status");

-- CreateIndex
CREATE INDEX "CarbonCredit_ownerUserId_idx" ON "CarbonCredit"("ownerUserId");

-- CreateIndex
CREATE INDEX "ChainAnchor_entityType_entityId_idx" ON "ChainAnchor"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ChainAnchor_txHash_idx" ON "ChainAnchor"("txHash");

-- CreateIndex
CREATE INDEX "CreditTransfer_creditId_idx" ON "CreditTransfer"("creditId");

-- CreateIndex
CREATE UNIQUE INDEX "Retirement_creditId_key" ON "Retirement"("creditId");

-- CreateIndex
CREATE UNIQUE INDEX "Retirement_certificateId_key" ON "Retirement"("certificateId");

-- CreateIndex
CREATE INDEX "Retirement_buyerId_idx" ON "Retirement"("buyerId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonitoringReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringReport" ADD CONSTRAINT "MonitoringReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringReport" ADD CONSTRAINT "MonitoringReport_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationPackage" ADD CONSTRAINT "VerificationPackage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonitoringReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationPackage" ADD CONSTRAINT "VerificationPackage_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonCredit" ADD CONSTRAINT "CarbonCredit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonCredit" ADD CONSTRAINT "CarbonCredit_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransfer" ADD CONSTRAINT "CreditTransfer_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "CarbonCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransfer" ADD CONSTRAINT "CreditTransfer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransfer" ADD CONSTRAINT "CreditTransfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retirement" ADD CONSTRAINT "Retirement_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "CarbonCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retirement" ADD CONSTRAINT "Retirement_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
