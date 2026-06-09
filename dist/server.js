
        import { createRequire } from 'module';
        const require = createRequire( import.meta.url );
    

// src/app.ts
import express from "express";
import cors from "cors";

// src/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
};
var AppError_default = AppError;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = err.message || "Internal Server Error";
  if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    error: err
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

// src/constants/httpStatus.ts
var HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

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
  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new AppError_default(HTTP_STATUS.BAD_REQUEST, "BAD Request");
  }
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
  const { name, email, password } = payload;
  const result = await pool.query(
    `
        UPDATE users SET name=COALESCE($1,name),
        email=COALESCE($2,email),
        password=COALESCE($3,password)
        WHERE id=$4 RETURNING *
      `,
    [name, email, password, id]
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
      statuscode: 204,
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
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
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
        return sendResponse_default(res, {
          statuscode: 404,
          success: false,
          message: "User Not Found!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statuscode: 403,
          success: false,
          message: "Forbidden Access!!"
        });
      }
      req.user = decoded;
      console.log("Decoded User:", decoded);
      console.log("req.user before next:", req.user);
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

// src/modules/issues/issues.query.ts
var ISSUE_SELECT_WITH_REPORTER = `
SELECT
  i.id,
  i.title,
  i.description,
  i.type,
  i.status,
  i.created_at,
  i.updated_at,

  u.id AS reporter_id,
  u.name AS reporter_name,
  u.role AS reporter_role

FROM issues i
INNER JOIN users u
ON i.reporter_id = u.id
`;

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const result = await pool.query(
    `
      INSERT INTO issues( title,description,type, reporter_id ) VALUES($1,$2,$3,$4) RETURNING *
      `,
    [title, description, type, reporter_id]
  );
  return result;
};
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = ISSUE_SELECT_WITH_REPORTER;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`i.type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`i.status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += sort === "oldest" ? " ORDER BY i.created_at ASC" : " ORDER BY i.created_at DESC";
  return await pool.query(sql, values);
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `${ISSUE_SELECT_WITH_REPORTER} WHERE i.id = $1`,
    [id]
  );
  return result;
};
var updateIssueIntoDB = async (id, payload, user) => {
  const existingIssue = await pool.query(
    `
  SELECT *
  FROM issues
  WHERE id = $1
  `,
    [id]
  );
  if (existingIssue.rows.length === 0) {
    throw new AppError_default(HTTP_STATUS.NOT_FOUND, "Issue not found");
  }
  const issue = existingIssue.rows[0];
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.userId) {
      throw new AppError_default(
        HTTP_STATUS.FORBIDDEN,
        "You can update only your own issues"
      );
    }
    if (issue.status !== "open") {
      throw new AppError_default(
        HTTP_STATUS.FORBIDDEN,
        "You can update only open issues"
      );
    }
  }
  const { title, description, type } = payload;
  if (title === void 0 && description === void 0 && type === void 0) {
    throw new AppError_default(
      HTTP_STATUS.BAD_REQUEST,
      "At least one field must be provided for update"
    );
  }
  const result = await pool.query(
    `
        UPDATE issues SET title=COALESCE($1,title),
        description=COALESCE($2,description),
        type=COALESCE($3,type),
        updated_at = NOW()
        WHERE id=$4 RETURNING *
      `,
    [title, description, type, id]
  );
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
      DELETE FROM issues WHERE id=$1
      `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/utility/joinQuery.ts
var formatIssue = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  status: row.status,
  reporter: {
    id: row.reporter_id,
    name: row.reporter_name,
    role: row.reporter_role
  },
  created_at: row.created_at,
  updated_at: row.updated_at
});

// src/middleware/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/modules/issues/issues.controller.ts
var createIssue = catchAsync_default(async (req, res) => {
  console.log("req.user:", req.user);
  const reporter_id = req.user?.id;
  if (!reporter_id) {
    return sendResponse_default(res, {
      statuscode: 401,
      success: false,
      message: "Unauthorized: reporter information is missing."
    });
  }
  const payload = {
    ...req.body,
    reporter_id
  };
  const result = await issueService.createIssueIntoDB(payload);
  sendResponse_default(res, {
    statuscode: 201,
    success: true,
    message: "Issue created successfully",
    data: result.rows[0]
  });
});
var getAllIssues = catchAsync_default(async (req, res) => {
  const result = await issueService.getAllIssuesFromDB(req.query);
  sendResponse_default(res, {
    statuscode: 200,
    success: true,
    message: "All issues retrieved successfully",
    data: result.rows.map(formatIssue)
  });
});
var getSingleIssue = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await issueService.getSingleIssueFromDB(id);
  sendResponse_default(res, {
    statuscode: 200,
    success: true,
    message: "Single issue retrieved successfully",
    data: formatIssue(result.rows[0])
  });
});
var UpdateIssue = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await issueService.updateIssueIntoDB(
    id,
    req.body,
    req.user
  );
  sendResponse_default(res, {
    statuscode: 200,
    success: true,
    message: "Issue updated successfully",
    data: result?.rows[0]
  });
});
var deleteIssue = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await issueService.deleteIssueFromDB(id);
  if (result.rowCount === 0) {
    throw new AppError_default(HTTP_STATUS.NOT_FOUND, "Issue Not Found!");
  }
  sendResponse_default(res, {
    statuscode: 204,
    success: true,
    message: "Issue deleted successfully",
    data: {}
  });
});
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  UpdateIssue,
  deleteIssue
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth_default(USER_ROLE.CONTRIBUTOR, USER_ROLE.MAINTAINER),
  issueController.createIssue
);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch(
  "/:id",
  auth_default(USER_ROLE.CONTRIBUTOR, USER_ROLE.MAINTAINER),
  issueController.UpdateIssue
);
router2.delete(
  "/:id",
  auth_default(USER_ROLE.MAINTAINER),
  issueController.deleteIssue
);
var issueRoute = router2;

// src/modules/auth/auth.route.ts
import Router3 from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
var signupUserIntoDB = async (payload) => {
  const result = await userService.createUserIntoDB(payload);
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `

    SELECT * FROM users WHERE email=$1

    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new AppError_default(HTTP_STATUS.BAD_REQUEST, "Invalid Credentials!");
  }
  const userInfo = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, userInfo.password);
  if (!matchPassword) {
    throw new AppError_default(HTTP_STATUS.BAD_REQUEST, "Invalid Credentials!");
  }
  const jwtPayload = {
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role
  };
  const token = jwt2.sign(jwtPayload, config_default.jwt_secret, {
    expiresIn: "10d"
  });
  const refreshToken2 = jwt2.sign(jwtPayload, config_default.refresh_secret, {
    expiresIn: "100d"
  });
  const user = {
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role,
    created_at: userInfo.created_at,
    updated_at: userInfo.updated_at
  };
  return { token, refreshToken: refreshToken2, user };
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
  signupUserIntoDB,
  loginUserIntoDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var signupUser = catchAsync_default(async (req, res) => {
  const result = await authService.signupUserIntoDB(req.body);
  sendResponse_default(res, {
    statuscode: 201,
    success: true,
    message: "User registered successfully",
    data: result.rows[0]
  });
});
var loginUser = catchAsync_default(async (req, res) => {
  const result = await authService.loginUserIntoDB(req.body);
  const { token, refreshToken: refreshToken2, user } = result;
  res.cookie("refreshToken", refreshToken2, {
    secure: false,
    sameSite: "lax"
  });
  sendResponse_default(res, {
    statuscode: 201,
    success: true,
    message: "Login successful",
    data: {
      token,
      user
    }
  });
});
var refreshToken = catchAsync_default(async (req, res) => {
  const result = await authService.generateRefreshToken(
    req.cookies.refreshToken
  );
  sendResponse_default(res, {
    statuscode: 201,
    success: true,
    message: "Access Token generated!",
    data: result
  });
});
var authController = {
  loginUser,
  refreshToken,
  signupUser
};

// src/modules/auth/auth.route.ts
var router3 = Router3();
router3.post("/signup", authController.signupUser);
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