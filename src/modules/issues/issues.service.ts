import type { JwtPayload } from "jsonwebtoken";
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
  const idFromResult = results.map((r) => r.reporter_id);

  const reporterData = idFromResult.map(async (id) => {
    const data = await pool.query(`
      SELECT * FROM users
      WHERE id=${id}
      `);
    return data.rows[0];
  });

  const reporters = await Promise.all(reporterData);

  const issuesWithReporterInfo = results.map((issue) => {
    const reporter = reporters.find((rep) => rep.id === issue.reporter_id);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role,
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });

  return issuesWithReporterInfo;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    SELECT * FROM issues
    WHERE id=$1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("No issue found.");
  }

  const user_id = result.rows[0].reporter_id;
  const userInfo = await pool.query(
    `
    SELECT * FROM users
    WHERE id=$1
    `,
    [user_id],
  );

  const issue = result.rows[0];
  const reporter = userInfo.rows[0];

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role,
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssueIntoDB = async (
  user: JwtPayload,
  id: string,
  payload: Partial<IIssue>,
) => {
  const { title, description, type } = payload;

  const issueToUpdate = await pool.query(
    `
    SELECT * FROM issues
    WHERE id=$1
    `,
    [id],
  );

  if(issueToUpdate.rowCount === 0){
    throw new Error("No issue found.")
  }

  const issueData = issueToUpdate.rows[0];

  if (user.role === "contributor") {
    if(user.id !== issueData.reporter_id || issueData.status !== "open"){
      throw new Error("Access forbidden.");
    }
  }

  const result = await pool.query(
    `
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3, type),
    updated_at=NOW()
    WHERE id=$4
    RETURNING *
    `,
    [title, description, type, id],
  );

  return result;
};

const deleteIssueInDB = async (id: string) => {
  const result = await pool.query(
    `
    DELETE FROM issues 
    WHERE id=$1
    `,
    [id],
  );
  return result;
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueInDB,
};
