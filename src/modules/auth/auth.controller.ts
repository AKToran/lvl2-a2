import type { Request, Response } from "express";
import { authService } from "./auth.service";


const signupUser = async(req: Request, res: Response) => {
  try {
    const result = await authService.signupUserIntoDB(req.body)
  } catch (error) { 
    console.log(error);
  }
}

export const authController = {
  signupUser
}