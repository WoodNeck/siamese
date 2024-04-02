import type Bot from "../Bot";
import type Command from "../Command";
import type { PermissionsBitField } from "discord.js";

/**
 * 봇 및 명령어를 실행하기 위해 필요한 권한이 할당되었는지 체크하고, 빠진 권한을 리턴
 */
const checkBotPermission = async (bot: Bot, cmd: Command, granted: Readonly<PermissionsBitField>) => {
  const botPermissions = bot.permissions;
  const cmdPermissions = cmd.permissions;

  const missingBotPermissions = botPermissions.filter(permission => !granted.has(permission.flag));
  const missingCmdPermissions = cmdPermissions.filter(permission => !granted.has(permission.flag));

  return {
    missingBotPermissions,
    missingCmdPermissions
  };
};

export default checkBotPermission;
