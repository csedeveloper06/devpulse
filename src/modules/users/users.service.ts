import { pool } from "../../db";
import type { IUser } from "./users.interface";
import bcrypt from "bcryptjs";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new Error("BAD Request");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users( name,email,password,role ) VALUES($1,$2,$3, COALESCE($4,'contributor'::user_role)) RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

const getAllUsersFromDB = async () => {
  const result = await pool.query(`
      SELECT * FROM users
      `);

  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM users WHERE id=$1
      `,
    [id],
  );
  return result;
};

const updateUserIntoDB = async (id: string, payload: any) => {
  const { name, email, password } = payload;
  const result = await pool.query(
    `
        UPDATE users SET name=COALESCE($1,name),
        email=COALESCE($2,email),
        password=COALESCE($3,password)
        WHERE id=$4 RETURNING *
      `,
    [name, email, password, id],
  );
  return result;
};

const deleteUserIntoDB = async (id: string) => {
  const result = await pool.query(
    `
      DELETE FROM users WHERE id=$1
      `,
    [id],
  );
  return result;
};

export const userService = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserIntoDB,
};
