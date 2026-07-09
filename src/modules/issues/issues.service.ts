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

const getAllIssuesFromDB = async (query: {
  sort?: string;
  type?: string;
  status?: string;
}) => {
  if (query.sort) {
    let sort_by = query.sort === "newest" ? "desc" : "asc";
    const result = await pool.query(`
    SELECT * FROM issues
    ORDER BY created_at ${sort_by}
    `);
    return result;
  } else if (query.type) {
    const result = await pool.query(`
    SELECT * FROM issues
    WHERE type='${query.type}'
    `);
    return result;
  }
  else if(query.status){
    const result = await pool.query(`
    SELECT * FROM issues
    WHERE status='${query.status}'
    `);
    return result;
  }
  else {
    const result = await pool.query(`
    SELECT * FROM issues
    ORDER BY created_at desc
    `);
    return result;
  } 
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
};
