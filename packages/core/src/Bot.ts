import path from "path";

import { env, isProduction } from "@siamese/env";
import { DiscordChannelLogger, error } from "@siamese/log";
import { bold, red } from "colorette";
import * as Discord from "discord.js";

import { DEFAULT_PERMISSIONS, type Permission } from "./const/permission";
import onAutocomplete from "./event/autocomplete";
import onError from "./event/error";
import onGuildJoin from "./event/guildJoin";
import onIconMessage from "./event/iconMessage";
import onInteractionCreate from "./event/interactionCreate";
import onMessage from "./event/message";
import onReady from "./event/ready";
import onWarn from "./event/warn";

import type Command from "./Command";
import type { Database } from "@siamese/db";

export interface BotOptions {
  /**
   * 데이터베이스 인스턴스
   */
  database: Database;
  /**
   * 명령어 파일들이 속한 디렉토리 경로
   */
  commands: string;
}

class Bot {
  public readonly commands: Map<string, Command>;
  public readonly permissions: Permission[];
  public readonly client: Discord.Client<true>;
  public readonly logger: DiscordChannelLogger;
  public readonly database: Database;

  private _commandsDir: string;

  public constructor(options: BotOptions) {
    this.commands = new Map();

    // 최소 권한을 정의
    this.permissions = [...DEFAULT_PERMISSIONS];

    this.client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMessageReactions
      ],
      partials: [Discord.Partials.Channel]
    });
    this.logger = new DiscordChannelLogger();
    this.database = options.database;

    this._commandsDir = options.commands;
  }

  public async start(): Promise<void> {
    try {
      await this._collectCommands();
      await this._registerSlashCommands();
      await this._addDiscordEventListeners();

      await this.client.login(env.BOT_TOKEN);

      await this.logger.connect(this.client);
      await onReady(this);
    } catch (err) {
      error(bold(red("봇 시작에 실패했습니다.")), { printToConsole: true });
      error(err as Error, { printToConsole: true });
    }
  }

  private async _collectCommands() {
    const commandDir = this._commandsDir;
    const collected = await this._collectInstances<Command>(commandDir);
    const registerCommands = collected.map(cmd => cmd.register(this));

    await Promise.all(registerCommands);
  }

  private async _registerSlashCommands() {
    const rest = new Discord.REST({ version: "9" }).setToken(env.BOT_TOKEN);
    const slashCommands = Array.from(new Set(this.commands.values()).values())
      .filter(command => !command.textOnly)
      .map(command => command.registerSlash())
      .filter(val => !!val)
      .map(builder => builder!.toJSON());

    try {
      await rest.put(
        isProduction
          ? Discord.Routes.applicationCommands(env.BOT_CLIENT_ID)
          : Discord.Routes.applicationGuildCommands(env.BOT_CLIENT_ID, env.BOT_DEV_SERVER_ID!),
        { body: slashCommands }
      );
    } catch (err) {
      error(err as Error, { printToConsole: true });
    }
  }

  private async _addDiscordEventListeners() {
    this.client.on(Discord.Events.GuildCreate, onGuildJoin.bind(void 0, this));
    this.client.on(Discord.Events.MessageCreate, onMessage.bind(void 0, this));
    this.client.on(Discord.Events.MessageCreate, onIconMessage.bind(void 0, this));
    this.client.on(Discord.Events.InteractionCreate, onInteractionCreate.bind(void 0, this));
    this.client.on(Discord.Events.InteractionCreate, onAutocomplete.bind(void 0, this));
    this.client.on(Discord.Events.Error, onError.bind(void 0, this));
    this.client.on(Discord.Events.Warn, onWarn.bind(void 0, this));
  }

  private async _collectInstances<T>(dir: string): Promise<T[]> {
    const glob = new Bun.Glob("**/!sub/!const.ts");
    const files = await Array.fromAsync(glob.scan(dir));

    return await Array.fromAsync(files.map(async file => {
      const CmdConstructor = (await import(path.join(dir, file))).default;

      return new CmdConstructor() as T;
    }));
  }
}

export default Bot;
