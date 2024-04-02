import { EmbedBuilder } from "@siamese/embed";
import { env } from "@siamese/env";
import { stripIndents } from "common-tags";
import { type Message } from "discord.js";

import { ERROR } from "../const/message";
import TextCommandContext from "../context/TextCommandContext";
import checkActiveRole from "../helper/checkActiveRole";
import checkBotPermission from "../helper/checkBotPermission";

import type Bot from "../Bot";

const onMessage = async (bot: Bot, msg: Message) => {
  const prefix = env.BOT_DEFAULT_PREFIX;

  if (msg.author.bot) return;
  if (!msg.content.startsWith(prefix)) return;

  let cmdName = msg.content.slice(prefix.length).split(/ +/)[0];

  // 커맨드 매칭 실패
  if (!bot.commands.has(cmdName)) return;

  let cmd = bot.commands.get(cmdName)!;
  let contentOffset = prefix.length + cmdName.length + 1;
  const content = msg.content.slice(contentOffset);

  // 서브커맨드 탐색
  const subcommandName = content.split(/ +/)[0];
  const subcommand = cmd.subcommands
    .find(subcmd => subcmd.name === subcommandName || subcmd.aliases.includes(subcommandName));

  if (subcommand) {
    cmd = subcommand;
    contentOffset += subcommandName.length + 1;
    cmdName = `${cmdName} ${cmd.name}`;
  }

  if (!cmd.executable) {
    return;
  }

  const ctx = new TextCommandContext(bot, cmd, msg, contentOffset);
  const preconditions = cmd.preconditions;

  // 슬래시 전용 명령어인지 테스트
  if (cmd.slashOnly) {
    await ctx.sender.replyError(ERROR.SLASH_ONLY_CMD);
    return;
  }

  // 명령어 사용 조건 테스트
  for (const precondition of preconditions) {
    const failed = !precondition.checkTextMessage(msg);

    if (failed) {
      return precondition.onFail(ctx);
    }
  }

  // 명령어 공통 사용조건 테스트
  if (msg.inGuild()) {
    // 길드별 설정에 의해 명령어 수행이 제한되었는지 체크
    const hasActiveRole = await checkActiveRole(msg.author, msg.channel);

    if (!hasActiveRole) {
      await ctx.sender.replyError(ERROR.NO_ACTIVE_ROLE);
      return;
    }

    // 봇이 길드 채널 내에서 명령어를 수행할 권한이 있는지 체크
    const botPermissions = msg.channel.permissionsFor(bot.client.user);
    if (!botPermissions) {
      return;
    }

    const { missingBotPermissions, missingCmdPermissions } = await checkBotPermission(bot, cmd, botPermissions);
    if (missingBotPermissions.length > 0) {
      await ctx.sender.replyError(ERROR.BOT_PERMISSIONS_MISSING(bot, missingBotPermissions));
      return;
    }

    if (missingCmdPermissions.length > 0) {
      await ctx.sender.replyError(ERROR.CMD_PERMISSIONS_MISSING(bot, missingBotPermissions));
      return;
    }
  }

  try {
    if (cmd.sendTyping) {
      await ctx.sender.sendThinking();
    }

    await cmd.execute(ctx);
  } catch (err) {
    await handleError(ctx, err);
  }
};

const handleError = async (ctx: TextCommandContext, err: unknown) => {
  await ctx.sender.replyError(ERROR.CMD_FAILED)
    .catch(() => void 0);

  const msg = ctx.msg;
  const errorDesc = stripIndents`
    ${ERROR.CMD_FAIL_PLACE(msg)}
    ${ERROR.CMD_FAIL_CMD(msg.content)}
    ${ERROR.CMD_FAIL_DESC(err)}`;

  const errorEmbed = new EmbedBuilder({
    title: ERROR.CMD_FAIL_TITLE(err),
    description: errorDesc
  });

  await ctx.bot.logger.error(errorEmbed);
};

export default onMessage;
