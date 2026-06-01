import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { userRoute } from "./modules/users/users.route";
import { issueRoute } from "./modules/issues/issues.route";
import { authRoute } from "./modules/auth/auth.route";

const app: Application = express();

//middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "DevPulse Team Members",
  });
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
