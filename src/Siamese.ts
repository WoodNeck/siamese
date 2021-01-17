import Discord, { MessageEmbed } from "discord.js";
import DBL from "dblapi.js";
import chalk from "chalk";

import Command from "~/commands/Command";
import ChannelLogger from "~/utils/ChannelLogger";
import ConsoleLogger from "./utils/ConsoleLogger";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";
import * as MSG from "~/const/message";
import EnvVariables from "~/types/EnvVariables";


class Siamese extends Discord.Client {
  public user: Discord.ClientUser;

  private _env: EnvVariables;
  // Commands handling
  private _commands: Map<string, Command>;
  // All permissions needed to execute every single commands
  // Least permission for a bot is defined
  private _permissions: Readonly<Discord.BitField<Discord.PermissionString>>;
  // Cooldowns, per type
  private _cooldowns: Map<string, Command>;
  private _dbl: DBL | null;
  private _logger: ChannelLogger | ConsoleLogger;

  public constructor(env: EnvVariables, options: Discord.ClientOptions) {
    super(options);

    this._env = env;

    this._commands = new Discord.Collection();
    this._cooldowns = new Discord.Collection();
    this._dbl = null;

    if (env.DBL_KEY) {
      this._dbl = new DBL(env.DBL_KEY, this);
    }
  }

  public async setup() {
    // Setup bot
    // await this._loadCommands();
    await this._setLogger();
    // await this._setupDatabase();
    // this._listenEvents();
  }

  public async start() {
    // Start bot
    await this.login(this._env.BOT_TOKEN).catch(err => {
      console.error(chalk.bold.red(ERROR.BOT.FAILED_TO_START));
      console.error(chalk.dim(err));
    });

    this.on("ready", this._onReady);
  }

  private _onReady = async () => {
    console.log(MSG.BOT.READY_INDICATOR(this));

    const readyMsg = new MessageEmbed()
      .setTitle(MSG.BOT.READY_TITLE(this))
      .setDescription(MSG.BOT.READY_DESC(this))
      .setThumbnail(this.user.avatarURL() as string)
      .setColor(COLOR.GOOD);

    await this._logger.info(readyMsg);
  };

  // public getNameInGuild(guild?: Discord.Guild) {
  //   return guild ? guild.member(this.user as Discord.ClientUser)?.displayName : this.user?.username;
  // }

  // public get db() { return this._db; }
  // public get prefix() { return this._env.BOT_DEFAULT_PREFIX; }
  // public get logger() { return this._logger; }
  // public get commands() { return this._commands; }
  // public get permissions() { return this._permissions; }
  // public get cooldowns() { return this._cooldowns; }

  private async _setLogger() {
    const env = this._env;

    if (env.BOT_LOG_VERBOSE_CHANNEL && env.BOT_LOG_ERROR_CHANNEL) {
      const logger = new ChannelLogger();
      await logger.setChannels(this, {
        info: env.BOT_LOG_VERBOSE_CHANNEL,
        error: env.BOT_LOG_ERROR_CHANNEL
      }).then(() => {
        this._logger = logger;
      }).catch(() => {
        this._logger = new ConsoleLogger();
      });
    } else {
      this._logger = new ConsoleLogger();
    }
  }

  // // Used in ready event, as logger should be provided
  // private async _setupDatabase() {
  // 	this._db = await loadDatabase(this);
  // }

  // private async _loadCommands() {
  // 	const permissions = new Discord.Permissions(PERMISSION.VIEW_CHANNEL.flag);
  // 	permissions.add(PERMISSION.SEND_MESSAGES.flag);

  // 	this._commands = await loadAllCommands();
  // 	this._commands.forEach(command => {
  // 		command.permissions.forEach(permission => {
  // 			permissions.add(permission.flag);
  // 		});
  // 	});
  // 	this._permissions = permissions.freeze();
  // }

  // private _listenEvents() {
  //   Object.keys(events).forEach(evt => {
  //     const handler = events[evt];
  //     this.on(evt, handler.bind(this));
  //   });
  // }
}

export default Siamese;
