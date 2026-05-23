import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { Pool, Result } from "pg";
import sendResponse from "./utility/sendResponse";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();
const port = 5000;

//middlewares

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_A4piLJTQf6Ss@ep-late-smoke-ap8ah5c0-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(30) UNIQUE NOT NULL,
          password VARCHAR(30) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
    console.log("database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

initDB();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "DevPulse Team Members",
  });
});

app.post("/api/users", async (req: Request, res: Response) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const result = await pool.query(
      `
    INSERT INTO users( first_name,last_name,email,password ) VALUES($1,$2,$3,$4) RETURNING *
    `,
      [first_name, last_name, email, password],
    );

    const user = result.rows[0];

    const name = `${user.first_name} ${user.last_name}`;

    sendResponse(res, {
      statuscode: 201,
      success: true,
      message: "user created successfully!",
      data: {
        id: user.id,
        name,
        email: user.email,
        password: user.password,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
      `);

    sendResponse(res, {
      statuscode: 200,
      success: true,
      message: "Users retrieved successfully!",
      data: result.rows,
    });
  } catch (error: any) {
    sendResponse(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      data: error,
    });
  }
});

app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT * FROM users WHERE id=$1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      sendResponse(res, {
        statuscode: 404,
        success: false,
        message: "user not found!",
        data: {},
      });
    }

    sendResponse(res, {
      statuscode: 200,
      success: true,
      message: "user retrieved successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`DevPulse app listening on port ${port}`);
});
