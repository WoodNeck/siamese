import Discord, { MessageEmbed } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { joinVoiceChannel } from "@discordjs/voice";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import AutoPoster from "topgg-autoposter";
import { BasePoster } from "topgg-autoposter/dist/structs/BasePoster";
import pino from "pino";
import chalk from "chalk";
import mongoose from "mongoose";

import Category from "~/core/Category";
import Command from "~/core/Command";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import ChannelLogger from "~/core/ChannelLogger";
import ConsoleLogger from "~/core/ConsoleLogger";
import BoomBox from "~/core/sound/BoomBox";
import CommandCategories from "~/command";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";
import * as MSG from "~/const/message";
import * as DB from "~/const/database";
import * as PERMISSION from "~/const/permission";
import * as EMOJI from "~/const/emoji";
import { HELP } from "~/const/command/bot";
import { ACTIVITY, DISCORD_ERROR_CODE } from "~/const/discord";
import EnvVariables from "~/type/EnvVariables";
import logMessage from "~/database/logMessage";
import checkImageCommand from "~/database/checkImageCommand";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";
import checkActiveRole from "~/util/checkActiveRole";

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
  private _permissions: Readonly<Discord.BitField<Discord.PermissionString, bigint>>;
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

    this._categories = [...CommandCategories];
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
    await this._loadSlashCommands();
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

  public async send(ctx: CommandContext | SlashCommandContext, content: Discord.InteractionReplyOptions | Discord.MessageOptions) {
    if (ctx.isSlashCommand()) {
      const { interaction } = ctx;

      if (interaction.replied) {
        return await interaction.followUp(content as Discord.InteractionReplyOptions) as Discord.Message;
      } else {
        return await interaction.reply(content as Discord.InteractionReplyOptions);
      }
    } else {
      const { channel, command } = ctx;

      if (command.sendTyping) {
        await channel.sendTyping().catch(() => void 0);
      }

      return await channel.send(content as Discord.MessageOptions)
        .catch(err => {
          // Not a case of missing permission
          if (!(err instanceof Discord.DiscordAPIError
            && err.code === DISCORD_ERROR_CODE.MISSING_PERMISSION)) {
            this._fileLogger.error(err);
          }

          throw err;
        });
    }
  }

  public async replyError(ctx: CommandContext | SlashCommandContext, errorMsg: string, imageURL?: string) {
    const embed = new Discord.MessageEmbed()
      .setColor(COLOR.ERROR);

    if (imageURL) {
      embed.setImage(imageURL);
    }

    embed.setDescription(MSG.BOT.ERROR_MSG(ctx.author, errorMsg));

    if (ctx.isSlashCommand()) {
      const { interaction } = ctx;

      const send = interaction.replied
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction);

      await send({
        embeds: [embed],
        ephemeral: true
      }).catch(() => void 0);
    } else {
      await this.send(ctx, { embeds: [embed] }).catch(() => {
        const { guild, channel } = ctx;

        embed.setDescription(MSG.BOT.DM_ERROR_MSG(ctx.author, guild, channel, errorMsg));

        void ctx.author.send({ embeds: [embed] })
          .catch(() => void 0);
      });
    }
  }

  public getDisplayName(guild: Discord.Guild, user: Discord.User = this.user) {
    const userAsMember = guild.members.cache.get(user.id);

    return userAsMember ? userAsMember.displayName : user.username;
  }

  public async getBoomBox(ctx: CommandContext | SlashCommandContext): Promise<BoomBox | null> {
    const { guild } = ctx;
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
        await this.replyError(ctx, ERROR.SOUND.FAILED_TO_PLAY);

        boomBox.destroy();
      });

      boomBoxes.set(guild.id, boomBox);

      return boomBox;
    }
  }

  public async handleError(ctx: CommandContext, cmd: Command, err: Error) {
    const devServerInviteLink = this._env.BOT_DEV_SERVER_INVITE;

    cmd.onFail(ctx);

    await this.replyError(ctx, ERROR.CMD.FAILED(devServerInviteLink)).catch(() => void 0);
    await this._logger.error(err, ctx);
  }

  public async handleSlashError(ctx: SlashCommandContext, err: Error) {
    const devServerInviteLink = this._env.BOT_DEV_SERVER_INVITE;

    await ctx.interaction.reply(ERROR.CMD.FAILED(devServerInviteLink)).catch(() => void 0);
    await this._logger.error(err, ctx);
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

    // Update activity every 30 minutes
    setInterval(this._updateActivity, 1000 * 60 * 30);
    this._updateActivity();
  };

  private _updateActivity = () => {
    const activity = `${this._env.BOT_DEFAULT_PREFIX}${HELP.CMD}${EMOJI.CAT.GRINNING}`;

    this.user.setActivity(activity, {
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

  private async _loadSlashCommands() {
    const env = this._env;

    if (env.BOT_ENV !== "production" && !env.BOT_DEV_SERVER_ID) {
      // eslint-disable-next-line no-console
      console.warn(EMOJI.WARNING, MSG.BOT.SKIP_SLASH_CMD_REGISTER);
      return;
    }

    const rest = new REST({ version: "9" }).setToken(env.BOT_TOKEN);
    const slashCommands = this._categories
      .reduce((allCommands, category) => {
        return [...allCommands, ...category.commands];
      }, [])
      .filter(command => !!command.slashData)
      .map(command => {
        const slashData = command.slashData as SlashCommandBuilder;

        command.subcommands.forEach(subCmd => {
          if (!subCmd.slashData) return;

          slashData.addSubcommand(subCmd.slashData as SlashCommandSubcommandBuilder);
        });

        return command;
      })
      .map(command => command.slashData!.toJSON());

    try {
      await rest.put(
        env.BOT_ENV === "production"
          ? Routes.applicationCommands(env.BOT_CLIENT_ID)
          : Routes.applicationGuildCommands(env.BOT_CLIENT_ID, env.BOT_DEV_SERVER_ID!),
        { body: slashCommands },
      );
    } catch (error) {
      console.error(error);
    }
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
    this.on("messageCreate", this._onMessage);
    this.on("interactionCreate", this._onInteractionCreate);
    this.on("guildCreate", this._onGuildJoin);
    this.on("error", this._onError);
    this.on("warn", this._onWarn);
  }

  private _onMessage = async (msg: Discord.Message) => {
    const prefix = this._env.BOT_DEFAULT_PREFIX;
    const iconPrefix = this._env.BOT_ICON_PREFIX;

    if (msg.channel.type === "DM") return;

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

    const ctx = new CommandContext({
      bot: this,
      command: cmd,
      msg,
      content,
      channel: msg.channel as Discord.TextChannel,
      author: msg.member as Discord.GuildMember,
      guild: msg.guild as Discord.Guild
    });

    // Dev-only check
    if (cmd.devOnly && msg.author.id !== this._env.BOT_DEV_USER_ID) return;

    // Channel type check
    if (!ctx.channel.permissionsFor) {
      await this.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
      return;
    }

    // Config check
    const hasAdminPermission = !!ctx.channel.permissionsFor(ctx.author)?.has(PERMISSION.ADMINISTRATOR.flag);
    const hasActiveRole = await checkActiveRole({ guild: ctx.guild, author: ctx.author, hasAdminPermission });
    if (!hasActiveRole) {
      await msg.react(EMOJI.CROSS).catch(() => void 0);
      return;
    }

    // Admin permission check
    if (cmd.adminOnly && !hasAdminPermission) {
      await this.replyError(ctx, ERROR.CMD.USER_SHOULD_BE_ADMIN);
      return;
    }

    // Permissions check
    const permissionGranted = await cmd.checkPermissions(ctx);
    if (!permissionGranted) return;

    // Cooldown check
    const isOnCoolDown = await this._checkCooldown(ctx, cmd);
    if (isOnCoolDown) return;

    try {
      if (cmd.sendTyping) {
        await ctx.channel.sendTyping();
      }

      await cmd.execute(ctx);
    } catch (err) {
      await this.handleError(ctx, cmd, err);
    }
  };

  private _onInteractionCreate = async (interaction: Discord.CommandInteraction) => {
    const commands = this._commands;

    if (
      !interaction.isCommand()
      || !commands.has(interaction.commandName)
    ) return;

    if (!interaction.inGuild()) {
      return await interaction.reply({ content: ERROR.CMD.ONLY_IN_TEXT_CHANNEL });
    }

    let cmd = commands.get(interaction.commandName)!;

    if (cmd.subcommands) {
      const subCmd = interaction.options.getSubcommand(false);
      if (subCmd) {
        const subcommand = cmd.subcommands
          .find(subcmd => subcmd.name === subCmd || subcmd.alias.includes(subCmd));

        if (subcommand) {
          cmd = subcommand;
        }
      }
    }

    if (!cmd.execute) return;

    const ctx = new SlashCommandContext({
      bot: this,
      command: cmd,
      interaction,
      guild: interaction.guild!,
      author: interaction.member as Discord.GuildMember,
      channel: interaction.channel as Discord.TextChannel
    });

    // Dev-only check
    if (cmd.devOnly && interaction.user.id !== this._env.BOT_DEV_USER_ID) return;

    // Channel type check
    if (!ctx.channel.permissionsFor) {
      return await this.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    // Config check
    const hasAdminPermission = !!ctx.channel.permissionsFor(ctx.author)?.has(PERMISSION.ADMINISTRATOR.flag);
    const hasActiveRole = await checkActiveRole({ guild: ctx.guild, author: ctx.author, hasAdminPermission });
    if (!hasActiveRole) {
      return await this.replyError(ctx, ERROR.CMD.ONLY_ACTIVE_ROLES);
    }

    // Admin permission check
    if (cmd.adminOnly && !hasAdminPermission) {
      return await this.replyError(ctx, ERROR.CMD.USER_SHOULD_BE_ADMIN);
    }

    // Permissions check
    const permissionGranted = await cmd.checkPermissions(ctx);
    if (!permissionGranted) return;

    // Cooldown check
    const isOnCoolDown = await this._checkCooldown(ctx, cmd);
    if (isOnCoolDown) return;

    try {
      await cmd.execute(ctx);
    } catch (err) {
      console.error(err);
      await this.handleSlashError(ctx, err);
    }
  };

  private _onGuildJoin = async (guild: Discord.Guild) => {
    if (!(guild.systemChannel)) return;

    const permissions = guild.systemChannel.permissionsFor(this.user);

    if (!permissions || !permissions.has(PERMISSION.VIEW_CHANNEL.flag) || !permissions.has(PERMISSION.SEND_MESSAGES.flag)) return;

    const helpCmd = `${this.prefix}${HELP.CMD}`;
    const embedMsg = new MessageEmbed().setTitle(MSG.BOT.GUILD_JOIN_TITLE)
      .setDescription(MSG.BOT.GUILD_JOIN_DESC(this, helpCmd))
      .setThumbnail(this.user.avatarURL() || "")
      .setFooter({ text: MSG.BOT.GUILD_JOIN_FOOTER(this) })
      .setColor(COLOR.BOT);

    await guild.systemChannel.send({ embeds: [embedMsg] })
      .catch(() => void 0);
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

  private async _joinVoiceChannel(ctx: CommandContext | SlashCommandContext) {
    const { bot, author, guild } = ctx;
    const voiceChannel = author.voice.channel;
    const boomBoxes = this._boomBoxes;

    if (!voiceChannel) {
      return await this.replyError(ctx, ERROR.SOUND.JOIN_VOICE_CHANNEL_FIRST);
    }

    // Connection already exists
    if (!voiceChannel.joinable) {
      return await this.replyError(ctx, ERROR.SOUND.NO_PERMISSION_GRANTED);
    }
    if (voiceChannel.full) {
      return await this.replyError(ctx, ERROR.SOUND.VOICE_CHANNEL_IS_FULL);
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator as any
    });

    const stopBoomBox = () => {
      if (boomBoxes.has(guild.id)) {
        boomBoxes.get(guild.id)!.destroy();
      }
    };

    connection.on("error", async err => {
      await this.replyError(ctx, ERROR.SOUND.VOICE_CONNECTION_HAD_ERROR);
      await bot.logger.error(err, ctx);

      stopBoomBox();
    });

    return connection;
  }

  private async _checkCooldown(ctx: CommandContext | SlashCommandContext, cmd: Command): Promise<boolean> {
    const cooldown = cmd.cooldown;

    if (!cooldown) return false;

    const key = cooldown.getKey(ctx, cmd.name);
    const prevExecuteTime = this._cooldowns.get(key);
    if (prevExecuteTime) {
      // it's on cooldown, send inform msg
      const timeDiff = new Date().getTime() - prevExecuteTime.start.getTime();
      const diffInSeconds = (prevExecuteTime.duration - (timeDiff / 1000)).toFixed(1);

      await this.replyError(ctx, ERROR.CMD.ON_COOLDOWN(diffInSeconds));

      return true;
    } else {
      // it's not on cooldown
      this._cooldowns.set(key, {
        start: new Date(),
        duration: cooldown.duration
      });
      setTimeout(() => {
        this._cooldowns.delete(key);
      }, cooldown.duration * 1000);

      return false;
    }
  }
}

export default Siamese;
