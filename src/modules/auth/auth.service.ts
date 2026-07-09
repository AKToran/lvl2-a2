import bcrypt from "bcryptjs";
import type { IUser } from "./auth.interface";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config/env";

const signupUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1  
  `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials!");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credentials!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret_key, {
    expiresIn: "7d",
  });
  delete user.password;
  return { token: accessToken, user };
};

export const authService = {
  signupUserIntoDB,
  loginUserIntoDB,
};
