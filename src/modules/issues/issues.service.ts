import { pool } from "../../db";
import type { IIssue, IQuery } from "./issues.interface";

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

const getAllIssuesFromDB = async (query: IQuery) => {
  let result;
  if (query.sort) {
    let sort_by = query.sort === "newest" ? "desc" : "asc";
    result = await pool.query(`
    SELECT * FROM issues
    ORDER BY created_at ${sort_by}
    `);
  } else if (query.type) {
    result = await pool.query(`
    SELECT * FROM issues
    WHERE type='${query.type}'
    `);
  } else if (query.status) {
    result = await pool.query(`
    SELECT * FROM issues
    WHERE status='${query.status}'
    `);
  } else {
    result = await pool.query(`
    SELECT * FROM issues
    ORDER BY created_at desc
    `);
  }
  const results = result.rows;
  const idFromResult = results.map(r=> r.reporter_id);

  const reporterData = idFromResult.map(async(id)=>{
    const data = await pool.query(`
      SELECT * FROM users
      WHERE id=${id}
      `)
      return data.rows[0];
  })

  const reporters = await Promise.all(reporterData);

  const issuesWithReporterInfo = results.map((issue)=>{
    const reporter = reporters.find((rep)=> rep.id === issue.reporter_id);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at
    }
  });

  return issuesWithReporterInfo;
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
};
