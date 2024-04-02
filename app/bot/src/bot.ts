import path from "path";

import { Bot } from "@siamese/core";
import { Database } from "@siamese/db";
import { log } from "@siamese/log";

import { BOOT_INDICATOR } from "./const/log";

console.log(BOOT_INDICATOR);

const db = await Database.create();
const bot = new Bot({
  database: db,
  commands: path.resolve(__dirname, "./command")
});

log("--- STARTING BOT ---", { printToConsole: true });

await bot.start();

log(`[${new Date().toLocaleString("ko-KR")}] READY`, { printToConsole: true });
