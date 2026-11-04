"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn } from "../actions";
import { FormMessage } from "./form-message";
import { PasswordInput } from "./password-input";
import { useServerForm } from "./use-server-form";

const NOTICES: Record<string, { tone: "success" | "error"; text: string }> = {
  "link-invalid": {
    tone: "error",
    text: "That link is invalid or has expired. Links work once, for a few minutes, in the browser where you requested them.",
  },
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const notice = NOTICES[searchParams.get("error") ?? ""];

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { run, pending, result } = useServerForm(setError);

  return (
    <form onSubmit={handleSubmit((values) => run(() => signIn(values, next)))} noValidate className="space-y-5">
      {notice && !result && <FormMessage tone={notice.tone}>{notice.text}</FormMessage>}
      {next && !notice && !result && <FormMessage tone="success">Please log in to continue.</FormMessage>}
      {result?.message && <FormMessage tone={result.ok ? "success" : "error"}>{result.message}</FormMessage>}

      <FormField id="login-email" label="Email" error={errors.email?.message}>
        {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
      </FormField>

      <div className="space-y-2">
        <FormField id="login-password" label="Password" error={errors.password?.message}>
          {(field) => <PasswordInput {...field} autoComplete="current-password" {...register("password")} />}
        </FormField>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-lagoon-700 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
