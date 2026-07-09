import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import sendResponse from "../../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config/env";

const createIssues = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized access!",
      });
      return;
    }

    const decoded = jwt.verify(token, config.secret_key) as JwtPayload;

    const result = await issuesService.createIssuesIntoDB(decoded.id, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getAllIssuesFromDB(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const issuesController = {
  createIssues,
  getAllIssues,
};
