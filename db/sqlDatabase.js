import sqlite3 from "sqlite3";

let db;

export const initDatabase = async () => {
  db = new sqlite3.Database(
    "./db/storage.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      // db pathi app.js e göre al
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the sql database.");
    }
  );
};

export const getDB = () => {
  return db;
};
