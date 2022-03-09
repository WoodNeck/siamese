import Discord from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";

import Siamese from "~/Siamese";
import Cooldown from "~/core/Cooldown";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import { Permission } from "~/const/permission";
import * as ERROR from "~/const/error";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { RequiredField } from "~/type/helper";

interface CommandOption {
  name: string;
  description: string;
  usage: string;
  alias: readonly string[];
  execute: ((ctx: CommandContext | SlashCommandContext) => Promise<void>) | null;
  beforeRegister: ((bot: Siamese) => boolean) | null;
  devOnly: boolean;
  adminOnly: boolean;
  cooldown: Cooldown | null;
  sendTyping: boolean;
  permissions: Permission[];
  subcommands: Command[];
  slashData: SlashCommandBuilder | SlashCommandSubcommandBuilder | null;
}

class Command {
  public readonly name: CommandOption["name"];
  public readonly description: CommandOption["description"];
  public readonly usage: CommandOption["usage"];
  public readonly alias: CommandOption["alias"];
  public readonly execute: CommandOption["execute"];
  public readonly beforeRegister: CommandOption["beforeRegister"];
  public readonly devOnly: CommandOption["devOnly"];
  public readonly adminOnly: CommandOption["adminOnly"];
  public readonly cooldown: CommandOption["cooldown"];
  public readonly sendTyping: CommandOption["sendTyping"];
  public readonly permissions: CommandOption["permissions"];
  public readonly subcommands: CommandOption["subcommands"];
  public readonly slashData: CommandOption["slashData"];

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
    sendTyping = true,
    permissions = [],
    subcommands = [],
    slashData = null
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
    this.sendTyping = sendTyping;
    this.permissions = permissions;
    this.subcommands = subcommands;
    this.slashData = slashData;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  public onFail(ctx: CommandContext): void {
    return;
  }

  public async checkPermissions(ctx: CommandContext | SlashCommandContext): Promise<boolean> {
    const { channel } = ctx;

    return this._checkPermissionsForChannel(channel, ctx);
  }

  protected async _checkPermissionsForChannel(channel: Discord.TextChannel | Discord.BaseGuildVoiceChannel, ctx: CommandContext | SlashCommandContext) {
    const { bot } = ctx;

    const permissionsGranted = channel.permissionsFor(bot.user);
    const permissionsNeeded = this.permissions.map(permission => `- ${permission.message}`).join("\n");

    if (permissionsGranted && this.permissions && !this.permissions.every(permission => permissionsGranted.has(permission.flag))) {
      if (permissionsGranted.has(PERMISSION.SEND_MESSAGES.flag)) {
        await bot.send(ctx, { content: ERROR.CMD.PERMISSION_IS_MISSING(bot, permissionsNeeded) });
      } else if (
        permissionsGranted.has(PERMISSION.ADD_REACTIONS.flag)
        && permissionsGranted.has(PERMISSION.READ_MESSAGE_HISTORY.flag
        )) {

        if (ctx.isSlashCommand()) {
          await bot.replyError(ctx, ERROR.CMD.PERMISSION_IS_MISSING(bot, permissionsNeeded));
        } else {
          await ctx.msg.react(EMOJI.CROSS);
        }
      }
      return false;
    }

    return true;
  }
}

export default Command;
