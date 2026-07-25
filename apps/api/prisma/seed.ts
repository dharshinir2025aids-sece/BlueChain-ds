/**
 * BlueChain MRV — Prisma seed (Phase 3)
 *
 * Idempotent: deletes existing seed records in reverse-dependency order,
 * then re-inserts. Safe to run multiple times.
 *
 * Run:
 *   pnpm --filter @bluechain/api db:seed
 *   — or —
 *   cd apps/api && npx prisma db seed
 */

import {
  EcosystemType,
  KycStatus,
  ObservationType,
  OrgType,
  ProjectStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ─── Stable seed IDs ──────────────────────────────────────────────────────────
// Using deterministic IDs keeps re-runs idempotent and makes foreign-key
// wiring explicit and easy to follow.

const IDS = {
  orgs: {
    coastalRoots: "seed-org-coastal-roots",
    nccr: "seed-org-nccr",
  },
  users: {
    super: "seed-user-super",
    admin: "seed-user-admin",
    ngo: "seed-user-ngo",
    field: "seed-user-field",
    verifier: "seed-user-verifier",
    buyer: "seed-user-buyer",
  },
  project: "seed-project-pichavaram",
  plots: {
    sectorA: "seed-plot-sector-a",
    sectorB: "seed-plot-sector-b",
  },
  observations: {
    biomass: "seed-obs-biomass",
    photo: "seed-obs-photo",
    water: "seed-obs-water",
  },
} as const;

// ─── Cleanup (reverse dependency order) ──────────────────────────────────────
async function cleanup(): Promise<void> {
  console.log("🧹  Cleaning up previous seed data…");

  await prisma.observation.deleteMany({
    where: { id: { in: Object.values(IDS.observations) } },
  });
  await prisma.plot.deleteMany({
    where: { id: { in: Object.values(IDS.plots) } },
  });
  await prisma.project.deleteMany({
    where: { id: IDS.project },
  });
  await prisma.user.deleteMany({
    where: { id: { in: Object.values(IDS.users) } },
  });
  await prisma.organization.deleteMany({
    where: { id: { in: Object.values(IDS.orgs) } },
  });
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed(): Promise<void> {
  // ── 1. Organizations ────────────────────────────────────────────────────────
  console.log("🏢  Seeding organizations…");

  const coastalRoots = await prisma.organization.upsert({
    where: { id: IDS.orgs.coastalRoots },
    update: {},
    create: {
      id: IDS.orgs.coastalRoots,
      name: "Coastal Roots Foundation",
      type: OrgType.NGO,
      registrationNo: "MH-NGO-2018-004821",
      state: "Tamil Nadu",
    },
  });

  const nccr = await prisma.organization.upsert({
    where: { id: IDS.orgs.nccr },
    update: {},
    create: {
      id: IDS.orgs.nccr,
      name: "National Centre for Coastal Research",
      type: OrgType.GOV,
      registrationNo: "GOI-MoES-NCCR-001",
      state: "Tamil Nadu",
    },
  });

  console.log(`   ✓ ${coastalRoots.name} (${coastalRoots.type})`);
  console.log(`   ✓ ${nccr.name} (${nccr.type})`);

  // ── 2. Users ─────────────────────────────────────────────────────────────────
  console.log("👤  Seeding users…");

  // Hash all passwords in parallel to keep seed time reasonable
  const [
    superHash,
    adminHash,
    ngoHash,
    fieldHash,
    verifierHash,
    buyerHash,
  ] = await Promise.all([
    hash("SuperAdmin@123"),
    hash("NccrAdmin@123"),
    hash("NgoManager@123"),
    hash("FieldWorker@123"),
    hash("Verifier@123"),
    hash("BuyerUser@123"),
  ]);

  const superAdmin = await prisma.user.upsert({
    where: { id: IDS.users.super },
    update: {},
    create: {
      id: IDS.users.super,
      email: "super@bluechain.dev",
      passwordHash: superHash,
      name: "Dev Malhotra",
      role: Role.SUPER_ADMIN,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  const nccrAdmin = await prisma.user.upsert({
    where: { id: IDS.users.admin },
    update: {},
    create: {
      id: IDS.users.admin,
      email: "admin@bluechain.dev",
      passwordHash: adminHash,
      name: "Ananya Rao",
      role: Role.NCCR_ADMIN,
      orgId: nccr.id,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  const ngoManager = await prisma.user.upsert({
    where: { id: IDS.users.ngo },
    update: {},
    create: {
      id: IDS.users.ngo,
      email: "ngo@bluechain.dev",
      passwordHash: ngoHash,
      name: "Meera Krishnan",
      role: Role.NGO_MANAGER,
      orgId: coastalRoots.id,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  const fieldWorker = await prisma.user.upsert({
    where: { id: IDS.users.field },
    update: {},
    create: {
      id: IDS.users.field,
      email: "field@bluechain.dev",
      passwordHash: fieldHash,
      name: "Arjun Nair",
      role: Role.FIELD_WORKER,
      orgId: coastalRoots.id,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  const verifier = await prisma.user.upsert({
    where: { id: IDS.users.verifier },
    update: {},
    create: {
      id: IDS.users.verifier,
      email: "verifier@bluechain.dev",
      passwordHash: verifierHash,
      name: "Sofia Fernandes",
      role: Role.VERIFIER,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  const buyer = await prisma.user.upsert({
    where: { id: IDS.users.buyer },
    update: {},
    create: {
      id: IDS.users.buyer,
      email: "buyer@bluechain.dev",
      passwordHash: buyerHash,
      name: "Rohan Shah",
      role: Role.CORPORATE_BUYER,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  for (const u of [superAdmin, nccrAdmin, ngoManager, fieldWorker, verifier, buyer]) {
    console.log(`   ✓ ${u.name} <${u.email}> [${u.role}]`);
  }

  // ── 3. Project ───────────────────────────────────────────────────────────────
  console.log("🌿  Seeding project…");

  const project = await prisma.project.upsert({
    where: { id: IDS.project },
    update: {},
    create: {
      id: IDS.project,
      orgId: coastalRoots.id,
      title: "Pichavaram Community Mangrove Restoration",
      description:
        "Large-scale mangrove restoration across the Pichavaram wetland complex " +
        "in Cuddalore district, Tamil Nadu. The project targets degraded intertidal " +
        "zones with native Rhizophora and Avicennia species to sequester blue carbon " +
        "and restore coastal biodiversity.",
      ecosystemType: EcosystemType.MANGROVE,
      status: ProjectStatus.ACTIVE,
      methodology: "VM0033 — Tidal Wetland and Seagrass Restoration v2.0",
      areaHa: 1240.5,
      stateCode: "TN",
      startDate: new Date("2024-01-15"),
      createdById: ngoManager.id,
      boundaryGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [79.7726, 11.4254],
            [79.8012, 11.4254],
            [79.8012, 11.3971],
            [79.7726, 11.3971],
            [79.7726, 11.4254],
          ],
        ],
      },
    },
  });

  console.log(`   ✓ ${project.title} [${project.status}] — ${project.areaHa} ha`);

  // ── 4. Plots ─────────────────────────────────────────────────────────────────
  console.log("📍  Seeding plots…");

  const plotA = await prisma.plot.upsert({
    where: { id: IDS.plots.sectorA },
    update: {},
    create: {
      id: IDS.plots.sectorA,
      projectId: project.id,
      name: "Sector-A (Northern Intertidal)",
      centroidLat: 11.4140,
      centroidLng: 79.7869,
      areaHa: 620.0,
      geometryGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [79.7726, 11.4254],
            [79.8012, 11.4254],
            [79.8012, 11.4112],
            [79.7726, 11.4112],
            [79.7726, 11.4254],
          ],
        ],
      },
    },
  });

  const plotB = await prisma.plot.upsert({
    where: { id: IDS.plots.sectorB },
    update: {},
    create: {
      id: IDS.plots.sectorB,
      projectId: project.id,
      name: "Sector-B (Southern Creek Zone)",
      centroidLat: 11.4000,
      centroidLng: 79.7869,
      areaHa: 620.5,
      geometryGeoJson: {
        type: "Polygon",
        coordinates: [
          [
            [79.7726, 11.4112],
            [79.8012, 11.4112],
            [79.8012, 11.3971],
            [79.7726, 11.3971],
            [79.7726, 11.4112],
          ],
        ],
      },
    },
  });

  console.log(`   ✓ ${plotA.name} — ${plotA.areaHa} ha`);
  console.log(`   ✓ ${plotB.name} — ${plotB.areaHa} ha`);

  // ── 5. Observations ───────────────────────────────────────────────────────────
  console.log("🔬  Seeding observations…");

  const biomassObs = await prisma.observation.upsert({
    where: { id: IDS.observations.biomass },
    update: {},
    create: {
      id: IDS.observations.biomass,
      plotId: plotA.id,
      workerId: fieldWorker.id,
      type: ObservationType.BIOMASS,
      observedAt: new Date("2025-03-10T07:30:00Z"),
      gpsLat: 11.4138,
      gpsLng: 79.7872,
      notes:
        "Above-ground biomass sampling using 10 m × 10 m nested quadrats. " +
        "Dominant species: Rhizophora apiculata. Average canopy height 4.2 m.",
      metricsJson: {
        speciesDominant: "Rhizophora apiculata",
        canopyHeightM: 4.2,
        dbhCm: 8.6,
        stemDensityPerHa: 3200,
        aboveGroundBiomassT: 112.4,
        estimatedSequestrationTCO2e: 42.1,
      },
      aiScore: null,
      aiFlagsJson: null,
    },
  });

  const photoObs = await prisma.observation.upsert({
    where: { id: IDS.observations.photo },
    update: {},
    create: {
      id: IDS.observations.photo,
      plotId: plotA.id,
      workerId: fieldWorker.id,
      type: ObservationType.PHOTO_SURVEY,
      observedAt: new Date("2025-03-10T08:15:00Z"),
      gpsLat: 11.4135,
      gpsLng: 79.7875,
      notes:
        "Drone photo survey at 50 m AGL covering the northern transect. " +
        "12 georeferenced images captured. No significant degradation visible.",
      metricsJson: {
        altitudeM: 50,
        imageCount: 12,
        coverageHa: 48.0,
        cloudCoverPct: 5,
        ndviMean: 0.74,
      },
      aiScore: null,
      aiFlagsJson: null,
    },
  });

  const waterObs = await prisma.observation.upsert({
    where: { id: IDS.observations.water },
    update: {},
    create: {
      id: IDS.observations.water,
      plotId: plotB.id,
      workerId: fieldWorker.id,
      type: ObservationType.WATER_QUALITY,
      observedAt: new Date("2025-03-11T06:45:00Z"),
      gpsLat: 11.3998,
      gpsLng: 79.7865,
      notes:
        "Tidal creek water quality sampling at low tide. " +
        "Salinity and dissolved oxygen within expected ranges for healthy mangrove system.",
      metricsJson: {
        salinityPpt: 22.4,
        phValue: 7.8,
        dissolvedOxygenMgL: 6.2,
        turbidityNtu: 18.5,
        temperatureCelsius: 29.1,
        samplingDepthM: 0.5,
      },
      aiScore: null,
      aiFlagsJson: null,
    },
  });

  console.log(`   ✓ ${biomassObs.type} @ Plot A (${biomassObs.observedAt.toISOString().slice(0, 10)})`);
  console.log(`   ✓ ${photoObs.type} @ Plot A (${photoObs.observedAt.toISOString().slice(0, 10)})`);
  console.log(`   ✓ ${waterObs.type} @ Plot B (${waterObs.observedAt.toISOString().slice(0, 10)})`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("\n🌊  BlueChain MRV — Phase 3 seed\n");

  await cleanup();
  await seed();

  console.log("\n✅  Seed complete.\n");
  console.log("  Credentials (all emails @bluechain.dev):");
  console.log("  ┌─────────────────────────────────────────────────────────────┐");
  console.log("  │  Role             Email                    Password          │");
  console.log("  │─────────────────────────────────────────────────────────────│");
  console.log("  │  SUPER_ADMIN      super@bluechain.dev      SuperAdmin@123    │");
  console.log("  │  NCCR_ADMIN       admin@bluechain.dev      NccrAdmin@123     │");
  console.log("  │  NGO_MANAGER      ngo@bluechain.dev        NgoManager@123    │");
  console.log("  │  FIELD_WORKER     field@bluechain.dev      FieldWorker@123   │");
  console.log("  │  VERIFIER         verifier@bluechain.dev   Verifier@123      │");
  console.log("  │  CORPORATE_BUYER  buyer@bluechain.dev      BuyerUser@123     │");
  console.log("  └─────────────────────────────────────────────────────────────┘\n");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
