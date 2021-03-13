import Discord from "discord.js";

import Siamese from "~/Siamese";
import Cooldown from "~/core/Cooldown";
import { Permission } from "~/const/permission";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import CommandContext from "~/type/CommandContext";
import { RequiredField } from "~/type/helper";

interface CommandOption {
  name: string;
  description: string;
  usage: string;
  alias: readonly string[];
  execute: ((ctx: CommandContext) => Promise<void>) | null;
  beforeRegister: ((bot: Siamese) => boolean) | null;
  devOnly: boolean;
  adminOnly: boolean;
  cooldown: Cooldown | null;
  permissions: Permission[];
  subcommands: Command[];
}

class Command {
  public readonly name: string;
  public readonly description: string;
  public readonly usage: string;
  public readonly alias: readonly string[];
  public readonly execute: CommandOption["execute"];
  public readonly beforeRegister: CommandOption["beforeRegister"];
  public readonly devOnly: boolean;
  public readonly adminOnly: boolean;
  public readonly cooldown: Cooldown | null;
  public readonly permissions: Permission[];
  public readonly subcommands: Command[];

  public constructor({
    name,
    description = "",
    usage = "",
    alias = [],
    execute = null,
    beforeRegister = null,
    devOnly = false,
    adminOnly = false,
    cooldown = null,
    permissions = [],
    subcommands = []
  }: RequiredField<Partial<CommandOption>, "name">) {
    this.name = name;
    this.description = description;
    this.usage = usage;
    this.execute = execute;
    this.alias = alias;
    this.beforeRegister = beforeRegister;
    this.devOnly = devOnly;
    this.adminOnly = adminOnly;
    this.cooldown = cooldown;
    this.permissions = permissions;
    this.subcommands = subcommands;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  public async onFail(ctx: CommandContext): Promise<void> {
    return;
  }

  public async checkPermissions(ctx: CommandContext): Promise<boolean> {
    const { channel } = ctx;

    return this._checkPermissionsForChannel(channel, ctx);
  }

  protected async _checkPermissionsForChannel(channel: Discord.TextChannel | Discord.VoiceChannel, ctx: CommandContext) {
    const { bot, msg } = ctx;

    const permissionsGranted = channel.permissionsFor(bot.user);

    if (permissionsGranted && this.permissions && !this.permissions.every(permission => permissionsGranted.has(permission.flag))) {
      if (permissionsGranted.has(PERMISSION.SEND_MESSAGES.flag)) {
        const neededPermissionList = this.permissions.map(permission => `- ${permission.message}`).join("\n");
        await bot.send(ctx.channel, ERROR.CMD.PERMISSION_IS_MISSING(bot, neededPermissionList));
      } else if (
        permissionsGranted.has(PERMISSION.ADD_REACTIONS.flag)
        && permissionsGranted.has(PERMISSION.READ_MESSAGE_HISTORY.flag
        )) {
        await msg.react(EMOJI.CROSS);
      }
      return false;
    }

    return true;
  }
}

export default Command;
