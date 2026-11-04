import { z } from "zod";

/** Editable profile fields. The email is shown but cannot be changed here (it is the sign-in identity). */
export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Name is too long."),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long.")
    .regex(/^(\+?[0-9][0-9 ()-]{5,18}[0-9])?$/, "Enter a valid phone number, or leave it empty."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
