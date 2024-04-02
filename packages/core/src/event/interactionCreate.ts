
import { EmbedBuilder } from "@siamese/embed";
import { stripIndents } from "common-tags";

import { ERROR } from "../const/message";
import SlashCommandContext from "../context/SlashCommandContext";
import checkActiveRole from "../helper/checkActiveRole";
import checkBotPermission from "../helper/checkBotPermission";
import getInteractionCommand from "../helper/getInteractionCommand";

import type Bot from "../Bot";
import type { Interaction } from "discord.js";

// 슬래시 커맨드만 다룸
const onInteractionCreate = async (bot: Bot, interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = getInteractionCommand(interaction, bot);
  if (!cmd) return;

  const ctx = new SlashCommandContext(bot, cmd, interaction);
  const preconditions = cmd.preconditions;

  // 명령어 사용 조건 테스트
  for (const precondition of preconditions) {
    const failed = !precondition.checkSlashInteraction(interaction);

    if (failed) {
      return precondition.onFail(ctx);
    }
  }

  // 명령어 공통 사용조건 테스트
  if (interaction.inCachedGuild()) {
    // 길드별 설정에 의해 명령어 수행이 제한되었는지 체크
    const hasActiveRole = await checkActiveRole(interaction.user, interaction.channel);

    if (!hasActiveRole) {
      await ctx.sender.replyError(ERROR.NO_ACTIVE_ROLE);
      return;
    }

    // 봇이 길드 채널 내에서 명령어를 수행할 권한이 있는지 체크
    const granted = interaction.appPermissions;
    if (!granted) {
      return;
    }

    const { missingBotPermissions, missingCmdPermissions } = await checkBotPermission(bot, cmd, granted);
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
    if (cmd.deferReply) {
      await ctx.sender.sendThinking();
    }

    await cmd.execute(ctx);
  } catch (err) {
    await handleError(ctx, err);
  }
};

const handleError = async (ctx: SlashCommandContext, err: unknown) => {
  await ctx.sender.replyError(ERROR.CMD_FAILED);

  const interactionContent = ctx.interaction.options.data.map(option => option.value).join(" ");
  const errorDesc = stripIndents`
    ${ERROR.CMD_SLASH_FAIL_PLACE(ctx.interaction)}
    ${ERROR.CMD_FAIL_CMD(interactionContent)}
    ${ERROR.CMD_FAIL_DESC(err)}`;

  const errorEmbed = new EmbedBuilder({
    title: ERROR.CMD_FAIL_TITLE(err),
    description: errorDesc
  });

  await ctx.bot.logger.error(errorEmbed);
};

export default onInteractionCreate;
