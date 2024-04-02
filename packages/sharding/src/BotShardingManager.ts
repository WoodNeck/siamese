import { log } from "@siamese/log";
import * as Discord from "discord.js";

class BotShardingManager {
  private _manager: Discord.ShardingManager;

  public get shardCount() { return this._manager.shards.size; }

  public constructor(file: string, token: string) {
    const manager = new Discord.ShardingManager(file, {
      token
    });

    manager.on("shardCreate", shard => {
      log(`[🐈] Created (#${shard.id})`);
    });

    this._manager = manager;
  }

  public async start() {
    await this._manager.spawn();
  }
}

export default BotShardingManager;
