import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issues.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const result = issueService.createIssueIntoDB(req.body);

    sendResponse(res, {
      statuscode: 201,
      success: true,
      message: "issue created successfully!",
      data: (await result).rows[0],
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
