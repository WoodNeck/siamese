import { MessageEmbed } from "discord.js";
import chalk from "chalk";

import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import { dedent } from "~/util/helper";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";

class ConsoleLogger {
  public async info(msg: MessageEmbed) {
    const color = msg.hexColor || COLOR.INFO;

    const strMsg = dedent`
			${chalk.hex(color)(msg.title ? msg.title : "")}
			${msg.description ? msg.description : ""}
      ${msg.footer ? (msg.footer.text ? msg.footer.text : msg.footer as unknown as string) : ""}
      ${new Date().toLocaleString()}
		`;

    // eslint-disable-next-line no-console
    console.log(strMsg);
    return Promise.resolve();
  }

  public async warn(msg: MessageEmbed) {
    const color = msg.hexColor || COLOR.WARNING;

    const strMsg = dedent`
			${chalk.hex(color)(msg.title ? msg.title : "")}
			${msg.description ? msg.description : ""}
      ${msg.footer ? (msg.footer.text ? msg.footer.text : msg.footer as unknown as string) : ""}
      ${new Date().toLocaleString()}
		`;

    // eslint-disable-next-line no-console
    console.log(strMsg);
    return Promise.resolve();
  }

  // Helper function for formatted error logging
  public async error(err: Error, ctx?: CommandContext | SlashCommandContext) {
    const errorDesc = ctx && !ctx.isSlashCommand()
      ? `${ERROR.CMD.FAIL_PLACE(ctx.msg.channel, ctx.msg.guild)}\n${ERROR.CMD.FAIL_CMD(ctx.msg.content)}\n${ERROR.CMD.FAIL_DESC(err)}`
      : ERROR.CMD.FAIL_DESC(err);

    const strMsg = dedent`
      ${ERROR.CMD.FAIL_TITLE(err)}
      ${errorDesc}
      ${new Date().toLocaleString()}
    `;

    console.error(strMsg);
    return Promise.resolve();
  }
}

export default ConsoleLogger;
