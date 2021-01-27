import Discord from "discord.js";

import { Permission } from "~/const/permission";
import Cooldown from "~/core/Cooldown";
import CommandContext from "~/type/CommandContext";

interface CommandOption {
  name: string;
  description: string;
  execute?: (ctx: CommandContext) => Promise<void>;
  usage?: string;
  devOnly?: boolean;
  adminOnly?: boolean;
  cooldown?: Cooldown;
  permissions?: Permission[];
  subcommands?: Discord.Collection<string, Command>;
}

class Command {
  public readonly name: CommandOption["name"];
  public readonly description: CommandOption["description"];
  public readonly execute: CommandOption["execute"];
  public readonly usage: CommandOption["usage"];
  public readonly devOnly: CommandOption["devOnly"];
  public readonly adminOnly: CommandOption["adminOnly"];
  public readonly cooldown: CommandOption["cooldown"];
  public readonly permissions: CommandOption["permissions"];
  public readonly subcommands: CommandOption["subcommands"];

  public constructor({
    name,
    description,
    execute,
    usage,
    devOnly = false,
    adminOnly = false,
    cooldown,
    permissions,
    subcommands
  }: CommandOption) {
    this.name = name;
    this.description = description;
    this.execute = execute;
    this.usage = usage;
    this.devOnly = devOnly;
    this.adminOnly = adminOnly;
    this.cooldown = cooldown;
    this.permissions = permissions;
    this.subcommands = subcommands;
  }
}

export default Command;
