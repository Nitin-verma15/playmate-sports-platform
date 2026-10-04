import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  city: z.string().trim().optional(),
  college: z.string().trim().optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
  city: z.string().trim().optional(),
  college: z.string().trim().optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export const updateSportsSchema = z.object({
  sports: z.array(
    z.object({
      sport: z.string().trim().min(1, "Sport name is required"),
      skill_level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    })
  ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSportsInput = z.infer<typeof updateSportsSchema>;
export type SportItem = UpdateSportsInput["sports"][number];
