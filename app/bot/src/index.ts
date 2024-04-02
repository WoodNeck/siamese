import { env } from "@siamese/env";
import { log } from "@siamese/log";
import { BotShardingManager } from "@siamese/sharding";

import { BOOT_INDICATOR } from "./const/log";

console.log(BOOT_INDICATOR);

log("--- STARTING BOT ---", { printToConsole: true });

const manager = new BotShardingManager("./src/bot.ts", env.BOT_TOKEN);
await manager.start();

console.log(`[${new Date().toLocaleString("ko-KR")}](pid ${process.pid})\n봇 시작됨: ${manager.shardCount}개의 샤드 가동중`);

log(`[${new Date().toLocaleDateString("ko-KR")}] READY (${manager.shardCount} shards)`);
