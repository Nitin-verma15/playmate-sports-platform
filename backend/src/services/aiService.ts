import Groq from "groq-sdk";
import { z } from "zod";
import { pool } from "../config/database";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const filtersSchema = z.object({
  sport: z.enum(["Football", "Cricket", "Basketball", "Badminton", "Tennis"]).nullable(),
  skill_level: z.enum(["Beginner", "Intermediate", "Advanced"]).nullable(),
  time_of_day: z.enum(["Morning", "Afternoon", "Evening", "Night"]).nullable(),
  max_distance_km: z.number().positive().nullable(),
});

type ExtractedFilters = z.infer<typeof filtersSchema>;

export async function searchGames(query: string) {
  let filters: ExtractedFilters = {
    sport: null,
    skill_level: null,
    time_of_day: null,
    max_distance_km: null,
  };

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are a sports game search assistant. Extract search filters from the user query.
Return ONLY valid JSON with these exact fields (use null if not mentioned):
{
  "sport": one of ["Football", "Cricket", "Basketball", "Badminton", "Tennis"] or null,
  "skill_level": one of ["Beginner", "Intermediate", "Advanced"] or null,
  "time_of_day": one of ["Morning", "Afternoon", "Evening", "Night"] or null,
  "max_distance_km": a number or null
}
Return only the JSON object, nothing else.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    filters = filtersSchema.parse(parsed);
  } catch {
    // if Groq fails or returns invalid JSON, fall back to no filters
  }

  let whereClause = "WHERE g.status IN ('OPEN', 'FULL') AND g.scheduled_at > NOW()";
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.sport) {
    whereClause += ` AND g.sport = $${paramIndex++}`;
    values.push(filters.sport);
  }

  if (filters.skill_level) {
    whereClause += ` AND g.skill_level = $${paramIndex++}`;
    values.push(filters.skill_level);
  }

  if (filters.time_of_day) {
    const timeRanges: Record<string, [number, number]> = {
      Morning:   [6,  12],
      Afternoon: [12, 17],
      Evening:   [17, 21],
      Night:     [21, 24],
    };
    const [start, end] = timeRanges[filters.time_of_day];
    whereClause += ` AND EXTRACT(HOUR FROM (g.scheduled_at AT TIME ZONE 'Asia/Kolkata')) >= $${paramIndex++} AND EXTRACT(HOUR FROM (g.scheduled_at AT TIME ZONE 'Asia/Kolkata')) < $${paramIndex++}`;
    values.push(start, end);
  }

  const gamesQuery = `
    SELECT
      g.*,
      u.full_name AS organizer_name,
      COUNT(gm.id)::int AS current_players
    FROM games g
    JOIN users u ON g.organizer_id = u.id
    LEFT JOIN game_members gm ON g.id = gm.game_id
    ${whereClause}
    GROUP BY g.id, u.id
    ORDER BY g.scheduled_at ASC
    LIMIT 20
  `;

  const gamesResult = await pool.query(gamesQuery, values);

  return {
    filters,
    games: gamesResult.rows,
    count: gamesResult.rows.length,
  };
}
