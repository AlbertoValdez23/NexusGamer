import mysql from "mysql2/promise";
import { config } from "./config";

export const db = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  charset: "utf8mb4",
  decimalNumbers: true,
});
