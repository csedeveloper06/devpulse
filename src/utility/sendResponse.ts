import type { Response } from "express";

type TResponse<T, Q> = {
  statuscode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: Q;
};

const sendResponse = <T, Q>(res: Response, data: TResponse<T, Q>) => {
  res.status(data.statuscode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error,
  });
};

export default sendResponse;
