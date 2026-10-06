import { pool } from "../config/database";
import {
  CreateGameInput,
  UpdateGameInput,
  GetGamesQueryParams,
} from "../validators/gameSchemas";
import { calculateDistance } from "./locationService";

export async function createGame(firebaseUid: string, data: CreateGameInput) {
  const userResult = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const userId = userResult.rows[0].id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const gameQuery = `
      INSERT INTO games (
        organizer_id, sport, title, description, venue,
        latitude, longitude, scheduled_at, skill_level, max_players
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const gameValues = [
      userId,
      data.sport,
      data.title,
      data.description || null,
      data.venue,
      data.latitude || null,
      data.longitude || null,
      data.scheduled_at,
      data.skill_level,
      data.max_players,
    ];
    const gameResult = await client.query(gameQuery, gameValues);
    const createdGame = gameResult.rows[0];

    await client.query(
      "INSERT INTO game_members (game_id, user_id) VALUES ($1, $2)",
      [createdGame.id, userId]
    );

    await client.query("COMMIT");
    return createdGame;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getGames(params: GetGamesQueryParams) {
  let query = `
    SELECT 
      g.*,
      u.full_name AS organizer_name,
      u.avatar_url AS organizer_avatar,
      COUNT(gm.id)::int AS current_players
    FROM games g
    JOIN users u ON g.organizer_id = u.id
    LEFT JOIN game_members gm ON g.id = gm.game_id
    WHERE g.status = 'OPEN' AND g.scheduled_at > NOW()
  `;

  const values: any[] = [];
  let paramIndex = 1;

  if (params.sport) {
    query += ` AND g.sport = $${paramIndex++}`;
    values.push(params.sport);
  }

  if (params.skill) {
    query += ` AND g.skill_level = $${paramIndex++}`;
    values.push(params.skill);
  }

  query += ` GROUP BY g.id, u.id ORDER BY g.scheduled_at ASC`;

  const result = await pool.query(query, values);
  let games = result.rows;

  if (params.lat !== undefined && params.lng !== undefined) {
    const userLat = params.lat;
    const userLng = params.lng;
    const maxDistance = params.distance || 10;

    games = games
      .map((game) => {
        if (game.latitude && game.longitude) {
          const dist = calculateDistance(
            userLat,
            userLng,
            parseFloat(game.latitude),
            parseFloat(game.longitude)
          );
          return { ...game, distance: dist };
        }
        return { ...game, distance: null };
      })
      .filter((game) => game.distance === null || game.distance <= maxDistance)
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }

  return games;
}

export async function getGameById(gameId: number) {
  const gameQuery = `
    SELECT 
      g.*,
      u.full_name AS organizer_name,
      u.avatar_url AS organizer_avatar,
      COUNT(gm.id)::int AS current_players
    FROM games g
    JOIN users u ON g.organizer_id = u.id
    LEFT JOIN game_members gm ON g.id = gm.game_id
    WHERE g.id = $1
    GROUP BY g.id, u.id
  `;
  const gameResult = await pool.query(gameQuery, [gameId]);

  if (gameResult.rows.length === 0) {
    return null;
  }

  const game = gameResult.rows[0];

  const membersQuery = `
    SELECT u.id, u.full_name, u.avatar_url, gm.joined_at
    FROM game_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.game_id = $1
    ORDER BY gm.joined_at ASC
  `;
  const membersResult = await pool.query(membersQuery, [gameId]);

  return {
    ...game,
    members: membersResult.rows,
  };
}

export async function updateGame(
  gameId: number,
  firebaseUid: string,
  data: UpdateGameInput
) {
  const userResult = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );
  if (userResult.rows.length === 0) return { error: "USER_NOT_FOUND" };

  const userId = userResult.rows[0].id;

  const gameCheck = await pool.query(
    "SELECT organizer_id FROM games WHERE id = $1",
    [gameId]
  );
  if (gameCheck.rows.length === 0) return { error: "GAME_NOT_FOUND" };
  if (gameCheck.rows[0].organizer_id !== userId) return { error: "FORBIDDEN" };

  const query = `
    UPDATE games
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        venue = COALESCE($3, venue),
        latitude = COALESCE($4, latitude),
        longitude = COALESCE($5, longitude),
        scheduled_at = COALESCE($6, scheduled_at),
        max_players = COALESCE($7, max_players),
        updated_at = NOW()
    WHERE id = $8
    RETURNING *;
  `;
  const values = [
    data.title || null,
    data.description || null,
    data.venue || null,
    data.latitude || null,
    data.longitude || null,
    data.scheduled_at || null,
    data.max_players || null,
    gameId,
  ];

  const result = await pool.query(query, values);
  return { game: result.rows[0] };
}

export async function cancelGame(gameId: number, firebaseUid: string) {
  const userResult = await pool.query(
    "SELECT id FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );
  if (userResult.rows.length === 0) return { error: "USER_NOT_FOUND" };

  const userId = userResult.rows[0].id;

  const gameCheck = await pool.query(
    "SELECT organizer_id FROM games WHERE id = $1",
    [gameId]
  );
  if (gameCheck.rows.length === 0) return { error: "GAME_NOT_FOUND" };
  if (gameCheck.rows[0].organizer_id !== userId) return { error: "FORBIDDEN" };

  const result = await pool.query(
    "UPDATE games SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1 RETURNING *",
    [gameId]
  );

  return { game: result.rows[0] };
}
