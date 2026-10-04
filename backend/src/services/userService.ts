import { pool } from "../config/database";
import { CreateUserInput, UpdateUserInput, SportItem } from "../validators/userSchemas";

export async function createUser(firebaseUid: string, email: string, data: CreateUserInput) {
  const query = `
    INSERT INTO users (firebase_uid, email, full_name, city, college, avatar_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    firebaseUid,
    email,
    data.full_name,
    data.city || null,
    data.college || null,
    data.avatar_url || null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getUserByFirebaseUid(firebaseUid: string) {
  const userResult = await pool.query(
    "SELECT * FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  const sportsResult = await pool.query(
    "SELECT sport, skill_level FROM user_sports WHERE user_id = $1 ORDER BY id ASC",
    [user.id]
  );

  return {
    ...user,
    sports: sportsResult.rows,
  };
}

export async function updateUser(firebaseUid: string, data: UpdateUserInput) {
  const query = `
    UPDATE users
    SET full_name = COALESCE($1, full_name),
        city = COALESCE($2, city),
        college = COALESCE($3, college),
        avatar_url = COALESCE($4, avatar_url),
        updated_at = NOW()
    WHERE firebase_uid = $5
    RETURNING *;
  `;
  const values = [
    data.full_name || null,
    data.city || null,
    data.college || null,
    data.avatar_url || null,
    firebaseUid,
  ];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function setUserSports(firebaseUid: string, sports: SportItem[]) {
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
    await client.query("DELETE FROM user_sports WHERE user_id = $1", [userId]);

    for (const item of sports) {
      await client.query(
        "INSERT INTO user_sports (user_id, sport, skill_level) VALUES ($1, $2, $3)",
        [userId, item.sport, item.skill_level]
      );
    }

    await client.query("COMMIT");

    const updatedSports = await client.query(
      "SELECT sport, skill_level FROM user_sports WHERE user_id = $1 ORDER BY id ASC",
      [userId]
    );

    return updatedSports.rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
