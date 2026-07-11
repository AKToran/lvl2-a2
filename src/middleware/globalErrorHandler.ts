import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error.";

  if (message.includes("Forbidden access")) {
    statusCode = 403;
  } else if (message.includes("not found")) {
    statusCode = 404;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default globalErrorHandler;
