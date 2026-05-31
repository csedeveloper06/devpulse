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

    await pool.query(`

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'issue_type'
          ) THEN
          CREATE TYPE issue_type AS ENUM (
          'bug',
          'feature_request'
          );
        END IF;
      END $$;
      

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'issue_status'
          ) THEN
          CREATE TYPE issue_status AS ENUM (
          'open',
          'in_progress',
          'resolved'
          );
        END IF;
      END $$;

       CREATE TABLE IF NOT EXISTS issues(
         id SERIAL PRIMARY KEY,
         title VARCHAR(150) NOT NULL,
         description TEXT NOT NULL,
         type issue_type NOT NULL,
         status issue_status NOT NULL DEFAULT 'open',
         reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
         
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
       )
    
      `);
    console.log("database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};
