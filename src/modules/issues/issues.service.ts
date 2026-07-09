import { pool } from "../../db";
import type { IIssue } from "./issues.interface";

const createIssuesIntoDB = async (id: Number, payload: IIssue) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
      INSERT INTO issues(title, description, type, reporter_id)
      VALUES($1,$2,$3,$4)
      RETURNING *
  `,
    [title, description, type, id],
  );

  return result;
};

const getAllIssuesFromDB = async () => {
  const result = await pool.query(`
    SELECT * FROM issues
    `);
  return result;
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
};
