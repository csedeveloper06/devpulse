import type { IIssue, TUpdateIssue } from "./issues.interface";
import { pool } from "../../db";
import { ISSUE_SELECT_WITH_REPORTER } from "./issues.query";
import type { TJwtPayload } from "../auth/auth.interface";

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
const updateIssueIntoDB = async (
  id: string,
  payload: TUpdateIssue,
  user: TJwtPayload,
) => {
  const existingIssue = await pool.query(
    `
  SELECT *
  FROM issues
  WHERE id = $1
  `,
    [id],
  );

  if (existingIssue.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = existingIssue.rows[0];

  if (user.role === "contributor") {
    if (issue.reporter_id !== user.userId) {
      throw new Error("You can update only your own issues");
    }

    if (issue.status !== "open") {
      throw new Error("You can update only open issues");
    }
  }

  const { title, description, type } = payload;

  //? Optional: prevent empty update requests
  if (title === undefined && description === undefined && type === undefined) {
    throw new Error("At least one field must be provided for update");
  }

  const result = await pool.query(
    `
        UPDATE issues SET title=COALESCE($1,title),
        description=COALESCE($2,description),
        type=COALESCE($3,type),
        updated_at = NOW()
        WHERE id=$4 RETURNING *
      `,
    [title, description, type, id],
  );
  return result;
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      DELETE FROM issues WHERE id=$1
      `,
    [id],
  );
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};
