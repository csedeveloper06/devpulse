import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issues.service";
import { formatIssue } from "../../utility/joinQuery";

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

const getAllIssues = async (req: Request, res: Response) => {
  console.log(req.query);
  try {
    const result = await issueService.getAllIssuesFromDB(req.query);
    sendResponse(res, {
      statuscode: 201,
      success: true,
      message: "All issues retrieved successfully",
      data: result.rows.map(formatIssue),
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

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id as string);
    sendResponse(res, {
      statuscode: 201,
      success: true,
      message: "Single issue retrieved successfully",
      data: formatIssue(result.rows[0]),
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

const UpdateIssue = async (req: Request, res: Response) => {};

const deleteIssue = async (req: Request, res: Response) => {};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  UpdateIssue,
  deleteIssue,
};
