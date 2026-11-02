import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address.").trim().max(254),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  email: z.email("Enter a valid email address.").trim().max(254),
  subject: z.enum(["booking", "account", "partnership", "other"], { message: "Choose a topic." }),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters so we can help.")
    .max(2000, "Message is too long (2,000 characters max)."),
});

export type ContactInput = z.infer<typeof contactSchema>;
