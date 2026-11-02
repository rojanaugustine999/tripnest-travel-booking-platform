"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { contactSchema, type ContactInput } from "@/lib/validations/marketing";

const TOPICS: { value: ContactInput["subject"]; label: string }[] = [
  { value: "booking", label: "A booking" },
  { value: "account", label: "My account" },
  { value: "partnership", label: "List my property" },
  { value: "other", label: "Something else" },
];

/**
 * Contact form validated with Zod on the client.
 * Phase 3 is a demo (no message is sent). Phase 4/9 stores messages via a Server Action that validates again on the server.
 */
export function ContactForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: ContactInput) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    toast.success(`Thanks, ${values.name.split(" ")[0]}!`, {
      description: "Demo only — your message was not sent. Message storage arrives with the database.",
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
      <FormField id="contact-name" label="Full name" error={errors.name?.message} required>
        {(field) => <Input {...field} autoComplete="name" {...register("name")} />}
      </FormField>

      <FormField id="contact-email" label="Email" error={errors.email?.message} required>
        {(field) => <Input {...field} type="email" autoComplete="email" {...register("email")} />}
      </FormField>

      <FormField
        id="contact-subject"
        label="What is it about?"
        error={errors.subject?.message}
        required
        className="sm:col-span-2"
      >
        {(field) => (
          <Controller
            control={control}
            name="subject"
            render={({ field: { value, onChange, onBlur } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger {...field} onBlur={onBlur} className="w-full">
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </FormField>

      <FormField
        id="contact-message"
        label="Message"
        hint="Include your booking reference if you have one."
        error={errors.message?.message}
        required
        className="sm:col-span-2"
      >
        {(field) => <Textarea {...field} rows={6} className="min-h-36" {...register("message")} />}
      </FormField>

      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
