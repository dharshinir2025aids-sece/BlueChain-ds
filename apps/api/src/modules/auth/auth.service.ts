import type { Prisma, User } from "@prisma/client";
import { Role, type AuthResult, type AuthUser } from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../middleware/errorHandler";
import type { LoginBody, RegisterBody } from "./auth.validation";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as unknown as Role,
    orgId: user.orgId,
    walletAddress: user.walletAddress,
    kycStatus: user.kycStatus as unknown as AuthUser["kycStatus"],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function issue(user: User): AuthResult {
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role as unknown as Role,
  });
  return { token, user: toAuthUser(user) };
}

export async function register(input: RegisterBody): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: (input.role ?? Role.FIELD_WORKER) as Prisma.UserCreateInput["role"],
    },
  });

  return issue(user);
}

export async function login(input: LoginBody): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return issue(user);
}

export async function getProfile(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User no longer exists");
  }
  return toAuthUser(user);
}
