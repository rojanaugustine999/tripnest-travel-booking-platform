"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signUp } from "../actions";
import { FormMessage } from "./form-message";
import { PasswordInput } from "./password-input";
import { useServerForm } from "./use-server-form";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });
  const { run, pending, result } = useServerForm(setError);

  if (result?.ok) {
    return (
      <div className="space-y-5">
        <FormMessage tone="success">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1">{result.message}</p>
        </FormMessage>
        <Button variant="outline" className="w-full" onClick={() => reset()}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => run(() => signUp(values)))} noValidate className="space-y-5">
      {result?.message && <FormMessage tone="error">{result.message}</FormMessage>}

      <FormField id="register-name" label="Full name" error={errors.fullName?.message}>
        {(field) => <Input {...field} autoComplete="name" {...register("fullName")} />}
      </FormField>

      <FormField id="register-email" label="Email" error={errors.email?.message}>
        {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
      </FormField>

      <FormField
        id="register-password"
        label="Password"
        hint="At least 8 characters, with a letter and a number."
        error={errors.password?.message}
      >
        {(field) => <PasswordInput {...field} autoComplete="new-password" {...register("password")} />}
      </FormField>

      <FormField id="register-confirm" label="Confirm password" error={errors.confirmPassword?.message}>
        {(field) => <PasswordInput {...field} autoComplete="new-password" {...register("confirmPassword")} />}
      </FormField>

      <Button type="submit" size="lg" variant="cta" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
