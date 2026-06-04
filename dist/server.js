
        import { createRequire } from 'module';
        const require = createRequire( import.meta.url );
    

// src/app.ts
import express from "express";
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/users/users.route.ts
import {
  Router
} from "express";

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statuscode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  refresh_secret: process.env.REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
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
         reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
         
         created_at TIMESTAMP DEFAULT NOW(),
         updated_at TIMESTAMP DEFAULT NOW()
       )
    
      `);
    console.log("database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/users/users.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users( name,email,password,role ) VALUES($1,$2,$3, COALESCE($4,'contributor'::user_role)) RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var getAllUsersFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM users
      `);
  return result;
};
var getSingleUserFromDB = async (id) => {
  const result = await pool.query(
    `
      SELECT * FROM users WHERE id=$1
      `,
    [id]
  );
  return result;
};
var updateUserIntoDB = async (id, payload) => {
  const { first_name, last_name, email, password, is_active } = payload;
  const result = await pool.query(
    `
        UPDATE users SET first_name=COALESCE($1,first_name),
        last_name=COALESCE($2,last_name),
        email=COALESCE($3,email),
        password=COALESCE($4,password),
        is_active=COALESCE($5,is_active)
        WHERE id=$6 RETURNING *
      `,
    [first_name, last_name, email, password, is_active, id]
  );
  return result;
};
var deleteUserIntoDB = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM users WHERE id=$1
      `,
    [id]
  );
  return result;
};
var userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserIntoDB
};

// src/modules/users/users.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statuscode: 201,
      success: true,
      message: "user created successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsersFromDB();
    sendResponse_default(res, {
      statuscode: 200,
      success: true,
      message: "Users retrieved successfully!",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      data: error
    });
  }
};
var getSingleUser = async (req, res) => {
  const { id } = req.params;
  const result = await userService.getSingleUserFromDB(id);
  try {
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statuscode: 404,
        success: false,
        message: "user not found!",
        data: {}
      });
    }
    sendResponse_default(res, {
      statuscode: 200,
      success: true,
      message: "user retrieved successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserIntoDB(id, req.body);
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statuscode: 404,
        success: false,
        message: "user not found!",
        data: {}
      });
    }
    sendResponse_default(res, {
      statuscode: 200,
      success: true,
      message: "user updated successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserIntoDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statuscode: 404,
        success: false,
        message: "user not found!",
        data: {}
      });
    }
    sendResponse_default(res, {
      statuscode: 200,
      success: true,
      message: "user deleted successfully!",
      data: {}
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    console.log("roles : ", roles);
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statuscode: 401,
          success: false,
          message: "UnAuthorized Access!!"
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.jwt_secret
      );
      const userData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
        `,
        [decoded.email]
      );
      const user = userData.rows[0];
      console.log(user);
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statuscode: 404,
          success: false,
          message: "User Not Found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        sendResponse_default(res, {
          statuscode: 403,
          success: false,
          message: "Forbidden Access!!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/users/users.constant.ts
var USER_ROLE = {
  MAINTAINER: "maintainer",
  CONTRIBUTOR: "contributor"
};

// src/modules/users/users.route.ts
var router = Router();
router.post("/", userController.createUser);
router.get(
  "/",
  auth_default(USER_ROLE.MAINTAINER),
  userController.getAllUsers
);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
var userRoute = router;

// src/modules/issues/issues.route.ts
import Router2 from "express";

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const reporter = await pool.query(
    `

    SELECT * FROM users WHERE id=$1

    `,
    [reporter_id]
  );
  if (reporter.rows.length === 0) {
    throw new Error("user is not exists!");
  }
  const result = await pool.query(
    `
      INSERT INTO issues( title,description,type, reporter_id ) VALUES($1,$2,$3,$4) RETURNING *
      `,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssuesFromDB = async () => {
};
var getSingleIssueFromDB = async () => {
};
var updateIssueIntoDB = async () => {
};
var deleteIssueFromDB = async () => {
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = issueService.createIssueIntoDB(req.body);
    sendResponse_default(res, {
      statuscode: 201,
      success: true,
      message: "issue created successfully!",
      data: (await result).rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
};
var getSingleIssue = async (req, res) => {
};
var UpdateIssue = async (req, res) => {
};
var deleteIssue = async (req, res) => {
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  UpdateIssue,
  deleteIssue
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", issueController.createIssue);
router2.get("/", issueController.createIssue);
router2.get("/:id", issueController.createIssue);
router2.patch("/:id", issueController.createIssue);
router2.delete("/:id", issueController.createIssue);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import Router3 from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `

    SELECT * FROM users WHERE email=$1

    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.jwt_secret, {
    expiresIn: "10d"
  });
  const refreshToken2 = jwt2.sign(jwtPayload, config_default.refresh_secret, {
    expiresIn: "100d"
  });
  return { accessToken, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("UnAuthorized Access!!");
  }
  const decoded = jwt2.verify(
    token,
    config_default.refresh_secret
  );
  const userData = await pool.query(
    `
            SELECT * FROM users WHERE email=$1
        `,
    [decoded.email]
  );
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User Not Found!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt2.sign(jwtPayload, config_default.jwt_secret, {
    expiresIn: "10d"
  });
  return { accessToken };
};
var authService = {
  loginUserIntoDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      //* In production mode secure would be true
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statuscode: 201,
      success: true,
      message: "user logged in successfully!",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken
    );
    sendResponse_default(res, {
      statuscode: 201,
      success: true,
      message: "Access Token generated!",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/login", authController.loginUser);
router3.post("/refresh-token", authController.refreshToken);
var authRoute = router3;

// src/app.ts
import CookieParser from "cookie-parser";
var app = express();
app.use(CookieParser());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse Server",
    author: "DevPulse Team Members"
  });
});
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`DevPulse app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map