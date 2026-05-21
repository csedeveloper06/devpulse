import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { Pool } from "pg";

const app: Application = express();
const port = 5000;

//middlewares

app.use(express.json());

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_A4piLJTQf6Ss@ep-late-smoke-ap8ah5c0-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "DevPulse Team Members",
  });
});

app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  res.status(201).json({
    success: true,
    message: "user created successfully!",
    data: {
      name,
      email,
    },
  });
});

app.listen(port, () => {
  console.log(`DevPulse app listening on port ${port}`);
});
