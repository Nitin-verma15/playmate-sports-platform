import { z } from "zod";

export const createGameSchema = z.object({
  sport: z.string().trim().min(1, "Sport is required"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(60, "Title cannot exceed 60 characters"),
  description: z.string().trim().max(500).optional(),
  venue: z.string().trim().min(2, "Venue is required"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  scheduled_at: z
    .string()
    .datetime({ message: "Invalid date format, must be ISO 8601" })
    .refine((date) => new Date(date) > new Date(), {
      message: "Scheduled time must be in the future",
    }),
  skill_level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    message: "Skill level must be Beginner, Intermediate, or Advanced",
  }),
  max_players: z
    .number()
    .int("Max players must be a whole number")
    .min(2, "Game must have at least 2 players"),
});

export const updateGameSchema = z.object({
  title: z.string().trim().min(3).max(60).optional(),
  description: z.string().trim().max(500).optional(),
  venue: z.string().trim().min(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  scheduled_at: z
    .string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), {
      message: "Scheduled time must be in the future",
    })
    .optional(),
  max_players: z.number().int().min(2).optional(),
});

export const getGamesQuerySchema = z.object({
  sport: z.string().trim().optional(),
  skill: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  distance: z.coerce.number().positive().default(10).optional(),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
export type GetGamesQueryParams = z.infer<typeof getGamesQuerySchema>;
