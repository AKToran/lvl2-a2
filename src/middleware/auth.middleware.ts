import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Roles } from "../types";
import sendResponse from "../utility/sendResponse";
import config from "../config/env";
import { pool } from "../db";

const auth = (...roles: Roles[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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

      const userData = await pool.query(
        `
      SELECT * FROM users WHERE id=$1
      `,
        [decoded.id],
      );

      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found.",
        });
        return;
      }

      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden access.",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.log(error);
    }
  };
};


export default auth;