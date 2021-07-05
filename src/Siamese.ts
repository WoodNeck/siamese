import Discord, { MessageEmbed } from "discord.js";
import AutoPoster from "topgg-autoposter";
import { BasePoster } from "topgg-autoposter/dist/structs/BasePoster";
import pino from "pino";
import chalk from "chalk";
import mongoose from "mongoose";

import Category from "~/core/Category";
import Command from "~/core/Command";
import ChannelLogger from "~/core/ChannelLogger";
import ConsoleLogger from "~/core/ConsoleLogger";
import BoomBox from "~/core/sound/BoomBox";
import BotCategory from "~/command/bot";
import UtilityCategory from "~/command/utility";
import SearchCategory from "~/command/search";
import SteamCategory from "~/command/steam";
import HistoryCategory from "~/command/history";
import IconCategory from "~/command/icon";
import SoundCategory from "~/command/sound";
import SettingCategory from "~/command/setting";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";
import * as MSG from "~/const/message";
import * as DB from "~/const/database";
import * as PERMISSION from "~/const/permission";
import * as EMOJI from "~/const/emoji";
import { HELP } from "~/const/command/bot";
import { ACTIVITY, DISCORD_ERROR_CODE } from "~/const/discord";
import EnvVariables from "~/type/EnvVariables";
import CommandContext from "~/type/CommandContext";
import logMessage from "~/database/logMessage";
import checkImageCommand from "~/database/checkImageCommand";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";
import startTyping from "~/util/startTyping";

class Siamese extends Discord.Client {
  public user: Discord.ClientUser;

  private _database: mongoose.Connection;
  private _env: EnvVariables;
  private _categories: Category[];
  private _commands: Discord.Collection<string, Command>;
  // Cooldowns, per type
  private _cooldowns: Discord.Collection<string, { start: Date; duration: number }>;
  // All permissions needed to execute every single commands
  // Least permission for a bot is defined already
  private _permissions: Readonly<Discord.BitField<Discord.PermissionString>>;
  private _msgCounts: Discord.Collection<string, number>;
  private _boomBoxes: Discord.Collection<string, BoomBox>;
  private _dbl: BasePoster | null;
  private _logger: ChannelLogger | ConsoleLogger;
  private _fileLogger: pino.Logger;

  public get env() { return this._env; }
  public get prefix() { return this._env.BOT_DEFAULT_PREFIX; }
  public get categories() { return this._categories; }
  public get commands() { return this._commands; }
  public get msgCounts() { return this._msgCounts; }
  public get boomBoxes() { return this._boomBoxes; }
  public get database() { return this._database; }
  public get permissions() { return this._permissions; }
  public get logger() { return this._logger; }
  public get dbl() { return this._dbl; }

  public constructor({
    env,
    options,
    logger
  }: {
    env: EnvVariables;
    options: Discord.ClientOptions;
    logger: pino.Logger;
  }) {
    super(options);

    this._env = env;

    this._categories = [];
    this._commands = new Discord.Collection();
    this._cooldowns = new Discord.Collection();
    this._msgCounts = new Discord.Collection();
    this._boomBoxes = new Discord.Collection();
    this._fileLogger = logger;
    this._dbl = null;

    if (env.DBL_KEY) {
      this._dbl = AutoPoster(env.DBL_KEY, this);
    }
  }

  public async setup() {
    // Setup bot
    await this._setupDatabase();
    this._loadCommands();
    this._listenEvents();
  }

  public async start() {
    // Start bot
    await this.login(this._env.BOT_TOKEN)
      .then(async () => {
        await this._setLogger();
        await this._onReady();
      })
      .catch(err => {
        console.error(chalk.bold.red(ERROR.BOT.FAILED_TO_START));
        console.error(chalk.dim(err));
      });
  }

  public async send(channel: Discord.TextChannel, content: string | MessageEmbed | (Discord.MessageOptions & { split?: false | undefined })) {
    channel.stopTyping(true);

    return await channel.send(content)
      .catch(err => {
        // Not a case of missing permission
        if (!(err instanceof Discord.DiscordAPIError
          && err.code === DISCORD_ERROR_CODE.MISSING_PERMISSION)) {
          this._fileLogger.error(err);
        }

        return null;
      });
  }

  public async replyError(msg: Discord.Message, errorMsg: string, imageURL?: string) {
    const embed = new Discord.MessageEmbed()
      .setDescription(MSG.BOT.ERROR_MSG( msg.author, errorMsg))
      .setColor(COLOR.ERROR);

    if (imageURL) {
      embed.setImage(imageURL);
    }

    await this.send(msg.channel as Discord.TextChannel, embed);
  }

  public getDisplayName(guild: Discord.Guild, user: Discord.User = this.user) {
    const userAsMember = guild.member(user);

    return userAsMember ? userAsMember.displayName : user.username;
  }

  public async getBoomBox(ctx: CommandContext): Promise<BoomBox | null> {
    const { guild, msg } = ctx;
    const boomBoxes = this._boomBoxes;

    if (boomBoxes.has(guild.id)) {
      return boomBoxes.get(guild.id) as BoomBox;
    } else {
      // Create new player
      const connection = await this._joinVoiceChannel(ctx);
      if (!connection) return null;

      const guildConfig = await GuildConfig.findOne({ guildID: guild.id }).lean() as GuildConfigDocument;

      const boomBox = new BoomBox(connection, Boolean(!guildConfig || guildConfig.voiceAutoOut));
      boomBox.on("end", () => {
        boomBoxes.delete(guild.id);
      });
      boomBox.on("error", async err => {
        await this.logger.error(err);
        await this.replyError(msg, ERROR.SOUND.FAILED_TO_PLAY);

        boomBox.destroy();
      });

      boomBoxes.set(guild.id, boomBox);

      return boomBox;
    }
  }

  public async handleError(ctx: CommandContext, cmd: Command, err: Error) {
    const { msg, channel } = ctx;

    channel.stopTyping(true);

    await cmd.onFail(ctx);

    await this.replyError(msg, ERROR.CMD.FAILED);
    await this._logger.error(err, msg);
  }

  private _onReady = async () => {
    // eslint-disable-next-line no-console
    console.log(MSG.BOT.READY_INDICATOR(this));

    const readyMsg = new MessageEmbed()
      .setTitle(MSG.BOT.READY_TITLE(this))
      .setDescription(MSG.BOT.READY_DESC(this))
      .setThumbnail(this.user.avatarURL() as string)
      .setColor(COLOR.GOOD);

    await this._logger.info(readyMsg);

    const activity = `${this._env.BOT_DEFAULT_PREFIX}${HELP.CMD}${EMOJI.CAT.GRINNING}`;
    await this.user.setActivity(activity, {
      type: ACTIVITY.LISTENING
    });
  };

  private async _setLogger() {
    const env = this._env;

    if (env.BOT_LOG_INFO_CHANNEL && env.BOT_LOG_ERROR_CHANNEL) {
      const logger = new ChannelLogger();

      await logger.setChannels(this, {
        info: env.BOT_LOG_INFO_CHANNEL,
        error: env.BOT_LOG_ERROR_CHANNEL
      }).then(() => {
        this._logger = logger;
      }).catch(e => {
        console.error(e);
        this._logger = new ConsoleLogger();
      });
    } else {
      this._logger = new ConsoleLogger();
    }
  }

  private _loadCommands() {
    const commands = this._commands;
    const categories = this._categories;
  	const permissions = new Discord.Permissions(PERMISSION.VIEW_CHANNEL.flag);
    permissions.add(PERMISSION.SEND_MESSAGES.flag);

    categories.push(
      BotCategory,
      UtilityCategory,
      SearchCategory,
      SteamCategory,
      HistoryCategory,
      IconCategory,
      SoundCategory,
      SettingCategory
    );

  	categories.forEach(category => {
      category.commands.forEach(cmd => {
        if (cmd.beforeRegister && !cmd.beforeRegister(this)) {
          console.warn(EMOJI.WARNING, chalk.yellow(MSG.BOT.CMD_REGISTER_FAILED(cmd)));
        }
        commands.set(cmd.name, cmd);
        cmd.alias.forEach(alias => {
          commands.set(alias, cmd);
        });
      });
    });

    commands.filter(cmd => !!cmd.permissions)
      .forEach(command => {
  		  command.permissions.forEach(permission => {
          permissions.add(permission.flag);
        });
  	  });

  	this._permissions = permissions.freeze();
  }

  private async _setupDatabase() {
    await mongoose.connect(DB.URI, {
      autoIndex: false,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    }).catch((err: Error) => {
      console.error(chalk.bold.red(ERROR.BOT.FAILED_TO_INIT_DB));
      console.error(chalk.dim(err.toString()));
      throw err;
    });

    const db = mongoose.connection;
    db.on("error", async err => {
      await this._logger.error(err);
    });

    this._database = db;
  }

  private _listenEvents() {
    this.on("message", this._onMessage);
    this.on("guildCreate", this._onGuildJoin);
    this.on("error", this._onError);
    this.on("warn", this._onWarn);
  }

  private _onMessage = async (msg: Discord.Message) => {
    const prefix = this._env.BOT_DEFAULT_PREFIX;
    const iconPrefix = this._env.BOT_ICON_PREFIX;

    void logMessage(this, msg);

    if (msg.author.bot) return;
    if (msg.content.startsWith(iconPrefix)) return await checkImageCommand(this, msg);
    if (!msg.content.startsWith(prefix)) return;

    let cmdName = msg.content.slice(prefix.length).split(/ +/)[0];

    // No command matched
    if (!this._commands.has(cmdName)) return;

    let cmd = this._commands.get(cmdName)!;
    // Exclude one blank after command name
    let content = msg.content.slice(prefix.length + cmdName.length + 1);
    const subcommandName = content.split(/ +/)[0];

    // Found subcommand
    const subcommand = cmd.subcommands.find(subcmd => subcmd.name === subcommandName || subcmd.alias.includes(subcommandName));
    if (subcommand) {
      cmd = subcommand;
      content = content.slice(subcommandName.length + 1);
      cmdName = `${cmdName} ${cmd.name}`;
    }

    // Case of subcommand-container
    // Only execute if it has execute() method
    if (!cmd.execute) {
      return;
    }

    const ctx: CommandContext = {
      bot: this,
      msg,
      content,
      channel: msg.channel as Discord.TextChannel,
      author: msg.member as Discord.GuildMember,
      guild: msg.guild as Discord.Guild,
      args: this._parseArgs(content)
    };

    // Dev-only check
    if (cmd.devOnly && msg.author.id !== this._env.BOT_DEV_USER_ID) return;

    // Channel type check
    if (!ctx.channel.permissionsFor) {
      await this.replyError(msg, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
      return;
    }

    // Admin permission check
    if (cmd.adminOnly && !ctx.channel.permissionsFor(ctx.author)?.has(PERMISSION.ADMINISTRATOR.flag)) {
      await this.replyError(msg, ERROR.CMD.USER_SHOULD_BE_ADMIN);
      return;
    }

    // Permissions check
    const permissionGranted = await cmd.checkPermissions(ctx);
    if (!permissionGranted) {
      return;
    }

    // Cooldown check
    const cooldown = cmd.cooldown;
    if (cooldown) {
      const key = cooldown.getKey(msg, cmdName);
      const prevExecuteTime = this._cooldowns.get(key);
      if (prevExecuteTime) {
        // it's on cooldown, send inform msg
        const timeDiff = new Date().getTime() - prevExecuteTime.start.getTime();
        const diffInSeconds = (prevExecuteTime.duration - (timeDiff / 1000)).toFixed(1);

        await this.replyError(msg, ERROR.CMD.ON_COOLDOWN(diffInSeconds));
        return;
      } else {
        // it's not on cooldown
        this._cooldowns.set(key, {
          start: new Date(),
          duration: cooldown.duration
        });
        setTimeout(() => {
          this._cooldowns.delete(key);
        }, cooldown.duration * 1000);
      }
    }

    try {
      if (cmd.sendTyping) {
        await startTyping(this, ctx.channel);
      }

      await cmd.execute(ctx);
    } catch (err) {
      await this.handleError(ctx, cmd, err);
    }
  };

  private _parseArgs(content: string) {
    const args: string[] = [];
    let lastIdx = 0;
    let idx = 0;

    while (idx < content.length) {
      const char = content[idx];

      if (char === " ") {
        // Split args by blank space;
        // Exclude multiple blanks
        if (lastIdx !== idx) {
          args.push(content.substring(lastIdx, idx));
        }

        idx += 1;
        lastIdx = idx;
      } else if (char === "\"" && lastIdx === idx) {
        // Bundle args bound in double quotes
        // Exclude quotes only separated by blank space
        const endIdx = content.indexOf("\" ", idx + 1);
        if (endIdx > 0) {
          args.push(content.substring(idx + 1, endIdx));
          lastIdx = endIdx + 2;
          idx = lastIdx;
        } else if (content.endsWith("\"")) {
          // Case of all remaining string is bound in double quote
          args.push(content.substring(idx + 1, content.length - 1));
          lastIdx = content.length;
          idx = lastIdx;
          break;
        } else {
          idx += 1;
        }
      } else {
        idx += 1;
      }
    }

    // Append last arg
    if (lastIdx < content.length) {
      args.push(content.substring(lastIdx, content.length));
    }

    // For blank arg, add double quotes for it as Discord won't accept blank message
    return args.map(arg => arg === " " ? `"${arg}"` : arg);
  }

  private _onGuildJoin = async (guild: Discord.Guild) => {
    if (!(guild.systemChannel)) return;

    const helpCmd = `${this.prefix}${HELP.CMD}`;
    const embedMsg = new MessageEmbed().setTitle(MSG.BOT.GUILD_JOIN_TITLE)
      .setDescription(MSG.BOT.GUILD_JOIN_DESC(this, helpCmd))
      .setThumbnail(this.user.avatarURL() || "")
      .setFooter(MSG.BOT.GUILD_JOIN_FOOTER(this))
      .setColor(COLOR.BOT);
    await this.send(guild.systemChannel, embedMsg);
  };

  private _onError = async (err: Error) => {
    await this._logger.error(err);
  };

  private _onWarn = async (info: string) => {
    const msg = new MessageEmbed()
      .setTitle(`${EMOJI.WARNING} WARNING`)
      .setDescription(info.toString());

    await this._logger.warn(msg);
  };

  private async _joinVoiceChannel(ctx: CommandContext) {
    const { msg, bot, author, guild } = ctx;

    const voiceChannel = author.voice.channel;
    const boomBoxes = this._boomBoxes;
    if (!voiceChannel) {
      return await this.replyError(msg, ERROR.SOUND.JOIN_VOICE_CHANNEL_FIRST);
    }

    // Connection already exists
    if (!voiceChannel.joinable) {
      return await this.replyError(msg, ERROR.SOUND.NO_PERMISSION_GRANTED);
    }
    if (voiceChannel.full) {
      return await this.replyError(msg, ERROR.SOUND.VOICE_CHANNEL_IS_FULL);
    }

    const connection = await voiceChannel.join();
    const stopBoomBox = () => {
      if (boomBoxes.has(guild.id)) {
        boomBoxes.get(guild.id)!.destroy();
      }
    };

    connection.on("error", async err => {
      await this.replyError(msg, ERROR.SOUND.VOICE_CONNECTION_HAD_ERROR);
      await bot.logger.error(err, msg);

      stopBoomBox();
    });

    connection.on("failed", async err => {
      await this.replyError(msg, ERROR.SOUND.VOICE_CONNECTION_JOIN_FAILED);
      await bot.logger.error(err, msg);

      stopBoomBox();
    });

    return connection;
  }
}

export default Siamese;
