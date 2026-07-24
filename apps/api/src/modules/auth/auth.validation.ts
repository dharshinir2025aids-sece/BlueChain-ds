import { z } from "zod";
import { ASSIGNABLE_ROLES, SELECTABLE_ROLES } from "@bluechain/shared";

const toValues = (roles: string[]) => roles as [string, ...string[]];

const name = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(120);
const email = z.string().trim().toLowerCase().email("A valid email is required");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

/** Public self-registration: only non-privileged roles may be chosen. */
export const registerSchema = z.object({
  name,
  email,
  password,
  role: z
    .enum(toValues(SELECTABLE_ROLES), {
      errorMap: () => ({
        message:
          "This role cannot be self-registered. Choose NGO, Buyer, or Field Officer.",
      }),
    })
    .optional(),
});

/** SUPER_ADMIN-only user creation: any assignable role, role required. */
export const adminCreateUserSchema = z.object({
  name,
  email,
  password,
  role: z.enum(toValues(ASSIGNABLE_ROLES), {
    errorMap: () => ({ message: "A valid role is required" }),
  }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type AdminCreateUserBody = z.infer<typeof adminCreateUserSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
