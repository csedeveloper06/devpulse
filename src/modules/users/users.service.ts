import { pool } from "../../db";

const createUserIntoDB = async (payload: any) => {
  const { first_name, last_name, email, password } = payload;

  const result = await pool.query(
    `
    INSERT INTO users( first_name,last_name,email,password ) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [first_name, last_name, email, password],
  );

  const user = result.rows[0];

  const name = `${user.first_name} ${user.last_name}`;
  return { user, name };
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
  const { first_name, last_name, email, password, is_active } = payload;
  const result = await pool.query(
    `
        UPDATE users SET first_name=COALESCE($1,first_name),
        last_name=COALESCE($2,last_name),
        email=COALESCE($3,email),
        password=COALESCE($4,password),
        is_active=COALESCE($5,is_active)
        WHERE id=$6 RETURNING *
      `,
    [first_name, last_name, email, password, is_active, id],
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
