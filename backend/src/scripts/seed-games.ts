import "dotenv/config";
import { pool } from "../config/database";

async function seedGames() {
  console.log("Seeding test games...");

  const userResult = await pool.query(
    "SELECT id FROM users LIMIT 1"
  );

  if (userResult.rows.length === 0) {
    console.log("No users found. Please register in the app first then run this script.");
    process.exit(1);
  }

  const organizerId = userResult.rows[0].id;

  const games = [
    {
      sport: "Cricket",
      title: "Morning Cricket Session",
      venue: "University Oval",
      scheduled_at: "2026-12-20T07:00:00.000Z",
      skill_level: "Beginner",
      max_players: 12,
      description: "Casual cricket for beginners, all welcome",
    },
    {
      sport: "Basketball",
      title: "3v3 Street Hoops",
      venue: "Campus Court B",
      scheduled_at: "2026-12-21T17:30:00.000Z",
      skill_level: "Advanced",
      max_players: 6,
      description: "Competitive 3v3 basketball, bring your A game",
    },
    {
      sport: "Badminton",
      title: "Evening Badminton",
      venue: "Sports Complex Court 2",
      scheduled_at: "2026-12-22T18:00:00.000Z",
      skill_level: "Beginner",
      max_players: 4,
      description: "Relaxed badminton for beginners",
    },
    {
      sport: "Football",
      title: "Weekend Kickabout",
      venue: "Central Park Ground A",
      scheduled_at: "2026-12-23T16:00:00.000Z",
      skill_level: "Intermediate",
      max_players: 16,
      description: "11-a-side football, intermediate level",
    },
    {
      sport: "Tennis",
      title: "Evening Tennis Rally",
      venue: "Club Courts 3 and 4",
      scheduled_at: "2026-12-24T17:00:00.000Z",
      skill_level: "Intermediate",
      max_players: 4,
      description: "Doubles tennis, intermediate players",
    },
    {
      sport: "Cricket",
      title: "T20 Practice Match",
      venue: "IIT Bangalore Ground",
      scheduled_at: "2026-12-25T08:00:00.000Z",
      skill_level: "Advanced",
      max_players: 22,
      description: "Full T20 match for experienced players",
    },
  ];

  for (const game of games) {
    const result = await pool.query(
      `INSERT INTO games
        (organizer_id, sport, title, venue, scheduled_at, skill_level, max_players, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN')
       RETURNING id`,
      [
        organizerId,
        game.sport,
        game.title,
        game.venue,
        game.scheduled_at,
        game.skill_level,
        game.max_players,
        game.description,
      ]
    );

    await pool.query(
      "INSERT INTO game_members (game_id, user_id) VALUES ($1, $2)",
      [result.rows[0].id, organizerId]
    );

    console.log(`Created: ${game.sport} — ${game.title}`);
  }

  console.log("Done! 6 test games added.");
  process.exit(0);
}

seedGames().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
