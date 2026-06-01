import type { IIssue } from "./issues.interface";
import { pool } from "../../db";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type, reporter_id } = payload;

  const reporter = await pool.query(
    `

    SELECT * FROM users WHERE id=$1

    `,
    [reporter_id],
  );

  if (reporter.rows.length === 0) {
    throw new Error("user is not exists!");
  }

  const result = await pool.query(
    `
      INSERT INTO issues( title,description,type, reporter_id ) VALUES($1,$2,$3,$4) RETURNING *
      `,
    [title, description, type, reporter_id],
  );
  return result;
};

const getAllIssuesFromDB = async () => {};

const getSingleIssueFromDB = async () => {};

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
