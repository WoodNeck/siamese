import Discord, { MessageEmbed } from "discord.js";
import chalk from "chalk";

import dedent from "~/utils/dedent";
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

    console.log(strMsg);
    return Promise.resolve();
  }

  // Helper function for formatted error logging
  public async error(err: Error, msg: Discord.Message) {
    const strMsg = dedent`
      ${ERROR.CMD.FAIL_TITLE(err)}
      ${msg ? `${ERROR.CMD.FAIL_PLACE(msg)}\n${ERROR.CMD.FAIL_CMD(msg)}\n${ERROR.CMD.FAIL_DESC(err)}` : ERROR.CMD.FAIL_DESC(err)}
      ${new Date().toLocaleString()}
    `;

    console.error(strMsg);
    return Promise.resolve();
  }
}

export default ConsoleLogger;
