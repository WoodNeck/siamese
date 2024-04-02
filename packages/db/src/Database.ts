import { error } from "@siamese/log";
import { bold, dim, red } from "colorette";
import mongoose from "mongoose";

import { DB_URI, FAILED_TO_INIT_DB } from "./const";

class Database {
  private _db: mongoose.Connection;

  private constructor(db: mongoose.Connection) {
    this._db = db;
  }

  public static async create() {
    try {
      await mongoose.connect(DB_URI, {
        autoIndex: false
      });

      const db = mongoose.connection;
      db.on("error", async err => {
        error(err);
      });

      return new Database(db);
    } catch (err) {
      error(bold(red(FAILED_TO_INIT_DB)), { printToConsole: true });
      error(dim((err as Error).toString()), { printToConsole: true });
      throw err;
    }

  }
}

export default Database;
