import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issueService } from "./issues.service";
import { formatIssue } from "../../utility/joinQuery";
import type { TJwtPayload } from "../auth/auth.interface";
import catchAsync from "../../middleware/catchAsync";
import AppError from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/httpStatus";

const createIssue = catchAsync(async (req: Request, res: Response) => {
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
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const result = await issueService.getAllIssuesFromDB(req.query);
  sendResponse(res, {
    statuscode: 200,
    success: true,
    message: "All issues retrieved successfully",
    data: result.rows.map(formatIssue),
  });
});

const getSingleIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await issueService.getSingleIssueFromDB(id as string);
  sendResponse(res, {
    statuscode: 200,
    success: true,
    message: "Single issue retrieved successfully",
    data: formatIssue(result.rows[0]),
  });
});

const UpdateIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await issueService.updateIssueIntoDB(
    id as string,
    req.body,
    req.user as TJwtPayload,
  );
  sendResponse(res, {
    statuscode: 200,
    success: true,
    message: "Issue updated successfully",
    data: result?.rows[0],
  });
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await issueService.deleteIssueFromDB(id as string);
  if (result.rowCount === 0) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Issue Not Found!");
  }
  sendResponse(res, {
    statuscode: 204,
    success: true,
    message: "Issue deleted successfully",
    data: {},
  });
});

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  UpdateIssue,
  deleteIssue,
};
