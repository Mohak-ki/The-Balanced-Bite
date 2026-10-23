import mysql from "mysql2/promise";
import config from "./config.js";

const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 4000,
});

export default db;
