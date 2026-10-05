/**
 * Public read-only routes — no authentication required.
 * Returns only non-sensitive project data appropriate for public display.
 */
import { Router, type Router as RouterType } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { prisma } from "../../config/prisma";

export const publicRouter: RouterType = Router();

// ─── GET /v1/public/projects
// Paginated list of projects with organisation summary.
// Filters: status, ecosystemType, stateCode, search (title contains)
publicRouter.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const status = req.query.status as string | undefined;
    const ecosystemType = req.query.ecosystemType as string | undefined;
    const stateCode = req.query.stateCode as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {
      ...(status && { status: status as never }),
      ...(ecosystemType && { ecosystemType: ecosystemType as never }),
      ...(stateCode && { stateCode }),
      ...(search && { title: { contains: search, mode: "insensitive" as const } }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          ecosystemType: true,
          status: true,
          areaHa: true,
          stateCode: true,
          methodology: true,
          startDate: true,
          createdAt: true,
          organization: { select: { id: true, name: true, type: true } },
          _count: { select: { plots: true, reports: true, credits: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    res.status(200).json({ success: true, data: { items, total, page, limit } });
  }),
);

// ─── GET /v1/public/projects/:id
// Single project detail — public-safe fields only.
publicRouter.get(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        ecosystemType: true,
        status: true,
        areaHa: true,
        stateCode: true,
        methodology: true,
        startDate: true,
        createdAt: true,
        organization: { select: { id: true, name: true, type: true } },
        _count: { select: { plots: true, reports: true, credits: true } },
        reports: {
          where: { status: "APPROVED" },
          select: { id: true, periodStart: true, periodEnd: true, status: true, ipfsCid: true, contentHash: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        credits: {
          select: { id: true, amounttCO2e: true, vintageYear: true, status: true, tokenId: true, txMint: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, error: { code: "PROJECT_NOT_FOUND", message: "Project not found" } });
      return;
    }

    res.status(200).json({ success: true, data: project });
  }),
);

// ─── GET /v1/public/stats
// Aggregate registry statistics for the public dashboard.
publicRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [totalProjects, verifiedProjects, activeProjects, totalCredits, mintedCredits, retiredCredits] = await prisma.$transaction([
      prisma.project.count(),
      prisma.project.count({ where: { status: "VERIFIED" } }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.carbonCredit.count(),
      prisma.carbonCredit.count({ where: { status: "MINTED" } }),
      prisma.carbonCredit.count({ where: { status: "RETIRED" } }),
    ]);

    const tco2e = await prisma.carbonCredit.aggregate({ _sum: { amounttCO2e: true } });

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        verifiedProjects: verifiedProjects + activeProjects,
        totalCredits,
        mintedCredits,
        retiredCredits,
        totalTco2e: tco2e._sum.amounttCO2e ?? 0,
      },
    });
  }),
);

export default publicRouter;
