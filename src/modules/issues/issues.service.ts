import type { IIssue } from "./issues.interface";
import { pool } from "../../db";
import { ISSUE_SELECT_WITH_REPORTER } from "./issues.query";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `
      INSERT INTO issues( title,description,type, reporter_id ) VALUES($1,$2,$3,$4) RETURNING *
      `,
    [title, description, type, reporter_id],
  );
  return result;
};

// const getAllIssuesFromDB = async () => {
//   const result = await pool.query(ISSUE_SELECT_WITH_REPORTER);
//   return result;
// };

const getAllIssuesFromDB = async (query: Record<string, unknown>) => {
  const { sort = "newest", type, status } = query;

  let sql = ISSUE_SELECT_WITH_REPORTER;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (type) {
    values.push(type);
    conditions.push(`i.type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`i.status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql +=
    sort === "oldest"
      ? " ORDER BY i.created_at ASC"
      : " ORDER BY i.created_at DESC";

  return await pool.query(sql, values);
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `${ISSUE_SELECT_WITH_REPORTER} WHERE i.id = $1`,
    [id],
  );
  return result;
};

//patch
const updateIssueIntoDB = async () => {};

const deleteIssueFromDB = async () => {};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};
