import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { UserRole } from "../modules/users/users.interface";

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("roles : ", roles);
    try {
      const token = req.headers.authorization;

      if (!token) {
        sendResponse(res, {
          statuscode: 401,
          success: false,
          message: "UnAuthorized Access!!",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.jwt_secret as string,
      ) as JwtPayload;

      const userData = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
        `,
        [decoded.email],
      );

      const user = userData.rows[0];
      console.log(user);

      if (userData.rows.length === 0) {
        sendResponse(res, {
          statuscode: 404,
          success: false,
          message: "User Not Found!",
        });
      }

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statuscode: 403,
          success: false,
          message: "Forbidden Access!!",
        });
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
