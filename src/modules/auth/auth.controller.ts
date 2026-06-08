import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";
import catchAsync from "../../middleware/catchAsync";

const signupUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.signupUserIntoDB(req.body);

  sendResponse(res, {
    statuscode: 201,
    success: true,
    message: "User registered successfully",
    data: result.rows[0],
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUserIntoDB(req.body);

  const { token, refreshToken, user } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false,
    sameSite: "lax",
  });

  sendResponse(res, {
    statuscode: 201,
    success: true,
    message: "Login successful",
    data: {
      token,
      user,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.generateRefreshToken(
    req.cookies.refreshToken,
  );
  sendResponse(res, {
    statuscode: 201,
    success: true,
    message: "Access Token generated!",
    data: result,
  });
});

export const authController = {
  loginUser,
  refreshToken,
  signupUser,
};
