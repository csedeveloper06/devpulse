import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { userService } from "./users.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    const { name, user } = result;
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
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getAllUsersFromDB();

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
};

const getSingleUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.getSingleUserFromDB(id as string);
  try {
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
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.updateUserIntoDB(id as string, req.body);
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
      message: "user updated successfully!",
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
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.deleteUserIntoDB(id as string);
    if (result.rowCount === 0) {
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
      message: "user deleted successfully!",
      data: {},
    });
  } catch (error: any) {
    sendResponse(res, {
      statuscode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
