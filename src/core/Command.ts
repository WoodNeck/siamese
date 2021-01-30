import { Permission } from "~/const/permission";
import Cooldown from "~/core/Cooldown";
import Siamese from "~/Siamese";
import CommandContext from "~/type/CommandContext";
import { RequiredField } from "~/type/helper";

interface CommandOption {
  name: string;
  description: string;
  usage: string;
  alias: string[];
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
  public readonly alias: string[];
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
}

export default Command;
