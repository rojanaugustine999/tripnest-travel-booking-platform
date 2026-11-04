"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/form-field";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { updatePassword } from "../actions";
import { FormMessage } from "./form-message";
import { PasswordInput } from "./password-input";
import { useServerForm } from "./use-server-form";

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { run, pending, result } = useServerForm(setError);

  return (
    <form onSubmit={handleSubmit((values) => run(() => updatePassword(values)))} noValidate className="space-y-5">
      {result?.message && <FormMessage tone={result.ok ? "success" : "error"}>{result.message}</FormMessage>}
      <FormField
        id="reset-password"
        label="New password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
      >
        {(field) => <PasswordInput {...field} autoComplete="new-password" {...register("password")} />}
      </FormField>
      <FormField id="reset-confirm" label="Confirm new password" error={errors.confirmPassword?.message}>
        {(field) => <PasswordInput {...field} autoComplete="new-password" {...register("confirmPassword")} />}
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
