"use server";

import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  safeNextPath,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

/*
 * Auth Server Actions. They run only on the server, so they re-validate every input with Zod
 * (the browser check is just for convenience) and never expose raw Supabase errors.
 */

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Turns Supabase Auth errors into friendly, non-revealing messages. */
function friendlyAuthError(code: string | undefined, status: number | undefined) {
  if (code === "over_email_send_rate_limit") {
    // Supabase's built-in email service (Free plan) sends at most 2 emails per hour per project.
    return "Email limit reached for now — this demo can send only 2 emails per hour. Please try again in about an hour.";
  }
  if (code === "over_request_rate_limit" || status === 429) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (code === "email_address_not_authorized") {
    return "This demo can only send emails to approved addresses. Please use the project owner's email.";
  }
  if (code === "weak_password") return "Please choose a stronger password.";
  if (code === "same_password") return "Your new password must be different from the old one.";
  return "Something went wrong. Please try again.";
}

/** Where email links (confirm sign-up, reset password) send the user back to. */
function confirmUrl(next: string) {
  return `${siteConfig.url}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export async function signIn(input: LoginInput, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { ok: false, message: "Please confirm your email first — check your inbox for the link." };
    }
    if (error.code === "invalid_credentials") {
      return { ok: false, message: "Email or password is incorrect." };
    }
    return { ok: false, message: friendlyAuthError(error.code, error.status) };
  }

  redirect(safeNextPath(next));
}

export async function signUp(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Read by the Phase 4 trigger to fill profiles.full_name. Never used for permissions.
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: confirmUrl("/dashboard"),
    },
  });

  if (error) return { ok: false, message: friendlyAuthError(error.code, error.status) };

  // If email confirmation is switched off in Supabase, the user is signed in straight away.
  if (data.session) redirect("/dashboard");

  // Same message whether or not the email was already registered, so the form can't be used
  // to discover who has an account.
  return {
    ok: true,
    message: `We've sent a confirmation link to ${parsed.data.email}. Open it in this browser to activate your account.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: confirmUrl("/reset-password"),
  });

  // Only rate limits are reported; any other outcome looks the same, so accounts can't be probed.
  if (error && (error.status === 429 || error.code?.startsWith("over_"))) {
    return { ok: false, message: friendlyAuthError(error.code, error.status) };
  }
  return {
    ok: true,
    message: "If an account exists for that email, a password reset link is on its way. Open it in this browser.",
  };
}

export async function updatePassword(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, message: "Your reset link has expired. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: friendlyAuthError(error.code, error.status) };

  redirect("/dashboard?notice=password-updated");
}
