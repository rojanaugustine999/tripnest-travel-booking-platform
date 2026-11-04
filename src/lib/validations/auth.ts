import { z } from "zod";

/**
 * Shared by the browser forms (instant feedback) and the Server Actions (the real check,
 * since anything sent from a browser can be tampered with).
 */

const email = z.email("Enter a valid email address.").trim().toLowerCase().max(254);

// Supabase hashes passwords with bcrypt, which only uses the first 72 bytes.
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const loginSchema = z.object({
  email,
  // Don't apply strength rules on login: show "incorrect" rather than hinting at the rules.
  password: z.string().min(1, "Enter your password.").max(72),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Name is too long."),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Only allow redirects to paths inside TripNest (e.g. "/dashboard"), never to other sites.
 * Protects ?next= links from being abused as an "open redirect" to a phishing page.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  try {
    const url = new URL(next, "http://tripnest.local");
    if (url.origin !== "http://tripnest.local") return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
