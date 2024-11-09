import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";

let db: Database | null = null;

// Singleton function to initialize or retrieve the existing db connection
const getDbConnection = async (): Promise<Database> => {
  if (!db) {
    db = await open({
      filename: "./database.db",
      driver: sqlite3.Database,
    });
  }
  return db;
};

export default getDbConnection;
