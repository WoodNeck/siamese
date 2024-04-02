import { ERROR } from "../const/message";

import type { Precondition } from "./Precondition";
import type CommandContext from "../context/CommandContext";
import type { ChatInputCommandInteraction, Message } from "discord.js";

class Cooldown implements Precondition {
  // USER ID - 시작 시간
  private _cooldown: Map<string, number>;
  private _duration: number;

  /**
   * @param duration 쿨다운을 적용할 시간 (초)
   */
  public constructor(duration: number) {
    this._cooldown = new Map();
    this._duration = duration;
  }

  public checkTextMessage(msg: Message): boolean {
    return this._checkCooldown(msg.author.id);
  }

  public checkSlashInteraction(interaction: ChatInputCommandInteraction): boolean {
    return this._checkCooldown(interaction.user.id);
  }

  public async onFail(ctx: CommandContext): Promise<void> {
    const userID = ctx.getUser().id;
    const prevExecuteTime = this._cooldown.get(userID);
    if (prevExecuteTime == null) return;

    const now = Date.now();
    const diff = now - prevExecuteTime;
    const timeLeft = (this._duration - diff / 1000).toFixed(1);

    await ctx.sender.replyError(ERROR.CMD_ON_COOLDOWN(timeLeft));
  }

  private _checkCooldown(userID: string): boolean {
    const prevExecuteTime = this._cooldown.get(userID);

    if (prevExecuteTime) {
      const now = Date.now();
      const diff = now - prevExecuteTime;
      const diffSec = diff / 1000;

      if (diffSec > this._duration) {
        this._cooldown.set(userID, now);
        return true;
      }

      // 쿨타임 내
      return false;
    } else {
      this._cooldown.set(userID, Date.now());
      return true;
    }
  }
}

export default Cooldown;
