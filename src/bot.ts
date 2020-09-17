import Discord from "discord.js";
import DBL from "dblapi.js";
import { Connection } from "mongoose";
import chalk from "chalk";
import events from "~/bot.on";
import Logger from "~/utils/logger";
import { loadDatabase } from "~/load/db";
import { loadAllCommands } from "~/load/command";
import ERROR from "~/consts/error";
import PERMISSION from "~/consts/permission";
import Command from "~/commands/Command";


class Bot extends Discord.Client {
  private _env: {[key: string]: string};
  // Commands handling
  private _commands: Map<string, Command>;
  // All permissions needed to execute every single commands
  // Least permission for a bot is defined
  private _permissions: Readonly<Discord.BitField<Discord.PermissionString>>;
  // Cooldowns, per type
  private _cooldowns: Map<string, Command>;
  private _dbl: DBL | null;
  private _logger: Logger;
  private _db: Connection;

	constructor(env: {[key: string]: string}, options: Discord.ClientOptions) {
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
    await this._loadCommands();
    await this._setLogger();
    await this._setupDatabase();
		this._listenEvents();
	}

	public async start() {
		// Start bot
		this.login(this._env.BOT_TOKEN)
			.catch(err => {
				console.error(chalk.bold.red(ERROR.BOT.FAILED_TO_START));
				console.error(chalk.dim(err));
			});
	}

	public getNameInGuild(guild?: Discord.Guild) {
		return guild ? guild.member(this.user!)!.displayName : this.user!.username;
	}

	public get db() { return this._db; }
	public get prefix() { return this._env.BOT_DEFAULT_PREFIX; }
	public get logger() { return this._logger; }
	public get commands() { return this._commands; }
	public get permissions() { return this._permissions; }
	public get cooldowns() { return this._cooldowns; }

	// Used in ready event
	private async _setLogger() {
		this._logger = new Logger();
		await this._logger.setChannels(this, {
			verbose: this._env.BOT_LOG_VERBOSE_CHANNEL,
			error: this._env.BOT_LOG_ERROR_CHANNEL,
		});
	}

	// Used in ready event, as logger should be provided
	private async _setupDatabase() {
		this._db = await loadDatabase(this);
	}

	private async _loadCommands() {
		const permissions = new Discord.Permissions(PERMISSION.VIEW_CHANNEL.flag);
		permissions.add(PERMISSION.SEND_MESSAGES.flag);

		this._commands = await loadAllCommands();
		this._commands.forEach(command => {
			command.permissions.forEach(permission => {
				permissions.add(permission.flag);
			});
		});
		this._permissions = permissions.freeze();
	}

	private _listenEvents() {
		Object.keys(events).forEach(evt => {
			const handler = events[evt];
			this.on(evt, handler.bind(this));
		});
	}
}

export default Bot;
