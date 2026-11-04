"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { FormMessage } from "@/features/auth/components/form-message";
import { useServerForm } from "@/features/auth/components/use-server-form";
import { updateProfile } from "../actions";
import { profileSchema, type ProfileInput } from "../validation";

export function ProfileForm({ defaults, email }: { defaults: ProfileInput; email: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const { run, pending, result } = useServerForm(setError);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        run(async () => {
          const res = await updateProfile(values);
          if (res.ok) router.refresh(); // update the name shown in the header
          return res;
        }),
      )}
      noValidate
      className="space-y-5"
    >
      {result?.message && <FormMessage tone={result.ok ? "success" : "error"}>{result.message}</FormMessage>}

      <FormField id="profile-name" label="Full name" required error={errors.fullName?.message}>
        {(field) => <Input {...field} autoComplete="name" {...register("fullName")} />}
      </FormField>

      <FormField
        id="profile-email"
        label="Email"
        hint="Your email is your sign-in identity and cannot be changed here."
      >
        {(field) => <Input {...field} value={email} readOnly disabled />}
      </FormField>

      <FormField id="profile-phone" label="Phone (optional)" error={errors.phone?.message}>
        {(field) => <Input {...field} type="tel" autoComplete="tel" {...register("phone")} />}
      </FormField>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />}
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
