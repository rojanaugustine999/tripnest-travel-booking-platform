"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "../actions";
import { FormMessage } from "./form-message";
import { useServerForm } from "./use-server-form";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  const { run, pending, result } = useServerForm(setError);

  if (result?.ok) return <FormMessage tone="success">{result.message}</FormMessage>;

  return (
    <form onSubmit={handleSubmit((values) => run(() => requestPasswordReset(values)))} noValidate className="space-y-5">
      {result?.message && <FormMessage tone="error">{result.message}</FormMessage>}
      <FormField id="forgot-email" label="Email" error={errors.email?.message}>
        {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Mail />}
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
