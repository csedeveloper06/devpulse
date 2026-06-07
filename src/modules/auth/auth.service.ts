import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { TAuthLogin } from "./auth.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import type { IUser } from "../users/users.interface";
import { userService } from "../users/users.service";

const signupUserIntoDB = async (payload: IUser) => {
  const result = await userService.createUserIntoDB(payload);

  return result;
};

const loginUserIntoDB = async (payload: TAuthLogin) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `

    SELECT * FROM users WHERE email=$1

    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  const userInfo = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, userInfo.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtPayload = {
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role,
  };

  const token = jwt.sign(jwtPayload, config.jwt_secret as string, {
    expiresIn: "10d",
  });

  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    expiresIn: "100d",
  });

  const user = {
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    role: userInfo.role,
    created_at: userInfo.created_at,
    updated_at: userInfo.updated_at,
  };

  return { token, refreshToken, user };
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("UnAuthorized Access!!");
  }

  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
  ) as JwtPayload;

  const userData = await pool.query(
    `
            SELECT * FROM users WHERE email=$1
        `,
    [decoded.email],
  );

  const user = userData.rows[0];

  if (userData.rows.length === 0) {
    throw new Error("User Not Found!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_secret as string, {
    expiresIn: "10d",
  });

  return { accessToken };
};

export const authService = {
  signupUserIntoDB,
  loginUserIntoDB,
  generateRefreshToken,
};
