import type { Prisma, User } from "@prisma/client";
import {
  PRIVILEGED_ROLES,
  Role,
  type AuthResult,
  type AuthUser,
} from "@bluechain/shared";
import { prisma } from "../../config/prisma";
import { hashPassword, verifyPassword } from "../../lib/password";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../middleware/errorHandler";
import type {
  AdminCreateUserBody,
  LoginBody,
  RegisterBody,
} from "./auth.validation";

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

async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role as Prisma.UserCreateInput["role"],
    },
  });
}

/** Public self-registration. Privileged roles are never allowed here. */
export async function register(input: RegisterBody): Promise<AuthResult> {
  const role = (input.role ?? Role.FIELD_WORKER) as Role;
  if (PRIVILEGED_ROLES.includes(role)) {
    throw new AppError(
      403,
      "ROLE_NOT_ALLOWED",
      "This role can only be assigned by an administrator",
    );
  }

  const user = await createUser({ ...input, role });
  return issue(user);
}

/** SUPER_ADMIN-only user creation. Allows any assignable role. */
export async function adminCreateUser(
  input: AdminCreateUserBody,
): Promise<AuthUser> {
  const user = await createUser({ ...input, role: input.role as Role });
  return toAuthUser(user);
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
