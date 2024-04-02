import { warn } from "@siamese/log";
import { yellow } from "colorette";
import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

import { CMD } from "./const/message";
import { DEFAULT_PERMISSIONS, type Permission } from "./const/permission";
import NSFWOnly from "./precondition/NSFWOnly";
import reorderUsage from "./usage/reorderUsage";

import type Bot from "./Bot";
import type { Category } from "./Category";
import type SubCommand from "./SubCommand";
import type AutocompleteContext from "./context/AutocompleteContext";
import type CommandContext from "./context/CommandContext";
import type { Precondition } from "./precondition/Precondition";
import type Usage from "./usage/Usage";

export interface CommandOptions {
  CMD: string;
  DESC: string;
  CATEGORY: Category;
  USAGE?: Usage[];
  EPEHEMERAL?: boolean;
  PERMISSIONS?: Permission[],
  ALIASES?: string[];
  [key: string]: unknown;
}

abstract class Command {
  public readonly name: string;
  public readonly description: string;
  public readonly aliases: string[];
  public readonly category: Category;
  public readonly usage: Usage[];
  public readonly permissions: Permission[];
  public readonly subcommands: SubCommand[];
  public readonly preconditions: Precondition[];
  /**
   * 실행 가능 여부
   *
   * 서브커맨드만 사용할 경우 `false`로 설정해야 함
   */
  public readonly executable: boolean;
  /**
   * 메시지로만 명령어를 사용할 수 있는지 여부
   */
  public readonly textOnly: boolean;
  /**
   * 슬래쉬 명령어로만 명령어를 사용할 수 있는지 여부
   */
  public readonly slashOnly: boolean;
  /**
   * 명령어를 수행하기 전에 채널에 sendTyping()을 수행할지 여부
   */
  public readonly sendTyping: boolean;
  /**
   * 명령어에 대한 답변이 명령어를 보낸 사람만 볼 수 있도록 할지 여부
   */
  public readonly ephemeral: boolean;
  /**
   * 명령어를 수행하기 전에 인터랙션에 deferReply()을 수행할지 여부
   * 명령어 초기 수행이 느릴 경우 사용해야 함
   */
  public readonly deferReply: boolean;

  public constructor() {
    const {
      data,
      executable = true,
      textOnly = false,
      slashOnly = false,
      sendTyping = true,
      ephemeral = false,
      deferReply = false,
      subcommands = [],
      preconditions = []
    } = this.define();
    const {
      CMD,
      DESC,
      CATEGORY,
      USAGE = [],
      PERMISSIONS = [],
      ALIASES = []
    } = data;

    this.name = CMD;
    this.description = DESC;
    this.aliases = ALIASES;
    this.category = CATEGORY;
    this.usage = USAGE;
    this.permissions = PERMISSIONS;

    this.executable = executable;
    this.textOnly = textOnly;
    this.slashOnly = slashOnly;
    this.sendTyping = sendTyping;
    this.ephemeral = ephemeral;
    this.deferReply = deferReply;
    this.subcommands = subcommands;
    this.preconditions = preconditions;
  }

  public abstract define(): {
    data: CommandOptions;
    textOnly?: boolean;
    slashOnly?: boolean;
    sendTyping?: boolean;
    ephemeral?: boolean;
    deferReply?: boolean;
    executable?: boolean;
    subcommands?: SubCommand[];
    preconditions?: Precondition[];
  }
  public abstract execute(ctx: CommandContext): Promise<void>;

  public async autocomplete(_ctx: AutocompleteContext): Promise<void> {
    // DO_NOTHING
  }

  public registerSlash() {
    if (this.textOnly) return;

    const builder = new SlashCommandBuilder();
    const preconditions = this.preconditions;
    const subcommands = this.subcommands;

    builder.setName(this.name);
    builder.setDescription(this.description);

    // 서브커맨드가 존재하는 경우 옵션을 추가할 수 없음
    if (subcommands.length <= 0) {
      // 재배열
      const usages = reorderUsage(this.usage);
      usages.forEach(usage => {
        usage.build(builder);
      });
    }

    // NSFW 체크
    const isNSFW = !!preconditions.find(precondition => precondition === NSFWOnly);
    builder.setNSFW(isNSFW);

    // 좀 더 자세하게 옵션을 정의
    const requiredPermissions = new Set([...DEFAULT_PERMISSIONS, ...this.permissions]);
    const requiredPermissionBit = new PermissionsBitField();
    requiredPermissions.forEach(permission => {
      requiredPermissionBit.add(permission.flag);
    });
    builder.setDefaultMemberPermissions(requiredPermissionBit.bitfield);

    const subSlashCommands = this.subcommands.map(cmd => cmd.registerSubSlash());
    subSlashCommands.forEach(cmd => {
      builder.addSubcommand(cmd);
    });

    return builder;
  }

  /**
   * 명령어를 등록 가능한지 여부를 확인하는 함수
   */
  public async canRegister(): Promise<boolean> {
    return true;
  }

  /**
   * 명령어를 명령어 목록에 등록함
   */
  public async register(bot: Bot) {
    if (!this.name) {
      warn(yellow(CMD.PRE_REGISTER_FAILED(this)));
      return;
    }

    const canRegister = await this.canRegister();
    if (!canRegister) {
      warn(yellow(CMD.PRE_REGISTER_FAILED(this)));
      return;
    }

    bot.commands.set(this.name, this);

    this.aliases.forEach(alias => {
      bot.commands.set(alias, this);
    });

    // 서브커맨드 확인
    const subcommands = this.subcommands;
    const availability = await Promise.all(subcommands.map(cmd => cmd.canRegister()));

    // 사용할 수 없는 커맨드는 제외 (in-place filter)
    subcommands.splice(0, subcommands.length, ...subcommands.filter((_, idx) => availability[idx]));

    // permission 등록
    this.permissions
      .filter(permission => !bot.permissions.includes(permission))
      .forEach(permission => {
        bot.permissions.push(permission);
      });

    subcommands.forEach(cmd => {
      cmd.permissions
        .filter(permission => !bot.permissions.includes(permission))
        .forEach(permission => {
          bot.permissions.push(permission);
        });
    });
  }

  /**
   * 명령어를 명령어 목록에서 제거함
   */
  public async unregister(bot: Bot) {
    bot.commands.delete(this.name);

    this.aliases.forEach(alias => {
      bot.commands.delete(alias);
    });
  }
}

export default Command;
