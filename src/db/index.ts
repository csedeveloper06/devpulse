import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_type
            WHERE typname = 'user_role'
          ) THEN
              CREATE TYPE user_role AS ENUM ('contributor', 'maintainer');
          END IF;
        END $$;
        CREATE TABLE IF NOT EXISTS users(
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          role user_role NOT NULL DEFAULT 'contributor',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
    console.log("database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};
