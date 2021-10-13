import Discord, { MessageEmbed } from "discord.js";
import chalk from "chalk";

import { dedent } from "~/util/helper";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";

class ConsoleLogger {
  public async info(msg: MessageEmbed) {
    const color = msg.hexColor || COLOR.INFO;

    const strMsg = dedent`
			${chalk.hex(color)(msg.title ? msg.title : "")}
			${msg.description ? msg.description : ""}
      ${msg.footer ? (msg.footer.text ? msg.footer.text : msg.footer as string) : ""}
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
      ${msg.footer ? (msg.footer.text ? msg.footer.text : msg.footer as string) : ""}
      ${new Date().toLocaleString()}
		`;

    // eslint-disable-next-line no-console
    console.log(strMsg);
    return Promise.resolve();
  }

  // Helper function for formatted error logging
  public async error(err: Error, msg?: {
    channel: Discord.TextBasedChannels;
    guild: Discord.Guild | null;
    content: string;
  }) {
    const strMsg = dedent`
      ${ERROR.CMD.FAIL_TITLE(err)}
      ${msg ? `${ERROR.CMD.FAIL_PLACE(msg.channel, msg.guild)}\n${ERROR.CMD.FAIL_CMD(msg.content)}\n${ERROR.CMD.FAIL_DESC(err)}` : ERROR.CMD.FAIL_DESC(err)}
      ${new Date().toLocaleString()}
    `;

    console.error(strMsg);
    return Promise.resolve();
  }
}

export default ConsoleLogger;
