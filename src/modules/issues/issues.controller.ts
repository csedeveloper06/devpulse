import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    console.log("req.user:", req.user);
    const reporter_id = req.user?.id;

    if (!reporter_id) {
      return sendResponse(res, {
        statuscode: 401,
        success: false,
        message: "Unauthorized: reporter information is missing.",
      });
    }

    const payload = {
      ...req.body,
      reporter_id,
    };

    const result = await issueService.createIssueIntoDB(payload);

    sendResponse(res, {
      statuscode: 201,
      success: true,
      message: "Issue created successfully",
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

const getAllIssues = async (req: Request, res: Response) => {};

const getSingleIssue = async (req: Request, res: Response) => {};

const UpdateIssue = async (req: Request, res: Response) => {};

const deleteIssue = async (req: Request, res: Response) => {};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  UpdateIssue,
  deleteIssue,
};
