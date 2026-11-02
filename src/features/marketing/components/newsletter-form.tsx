"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations/marketing";

/**
 * Newsletter sign-up. React Hook Form tracks the field; Zod validates it.
 * Phase 3 is a demo (nothing is stored). Phase 4 can store subscribers in Supabase.
 */
export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(values: NewsletterInput) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("You're on the list!", {
      description: `Demo only — ${values.email} was not stored. Newsletter storage arrives with the database.`,
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "newsletter-email-error" : undefined}
          className="h-12 border-white/20 bg-white text-slate-900"
          {...register("email")}
        />
        <Button type="submit" variant="cta" size="lg" disabled={isSubmitting} className="shrink-0">
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          Subscribe
        </Button>
      </div>
      {errors.email && (
        <p id="newsletter-email-error" role="alert" className="mt-2 text-sm font-medium text-coral-200">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
