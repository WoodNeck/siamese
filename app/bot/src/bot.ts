import path from "path";

import { Bot } from "@siamese/core";
import { Database } from "@siamese/db";
import { log } from "@siamese/log";

import { BOOT_INDICATOR } from "./const/log";

console.log(BOOT_INDICATOR);

const start = async () => {
  const db = await Database.create();
  const bot = new Bot({
    database: db,
    // FIXME: 필요시 import.meta.dirname을 __dirname으로 교체 가능
    commands: path.resolve(import.meta.dirname, "./command")
  });

  log("--- STARTING BOT ---", { printToConsole: true });

  await bot.start();

  log(`[${new Date().toLocaleString("ko-KR")}] READY`, { printToConsole: true });
};

start();
