import { MessageEmbed } from "discord.js";
import date from "date-and-time";

import Add from "./discharge/add";
import List from "./discharge/list";
import Remove from "./discharge/remove";

import Command from "~/core/Command";
import DateDiff from "~/core/DateDiff";
import Discharge, { DischargeDocument } from "~/model/Discharge";
import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { DISCHARGE } from "~/const/command/history";
import { clamp } from "~/util/helper";

export default new Command({
  name: DISCHARGE.CMD,
  description: DISCHARGE.DESC,
  usage: DISCHARGE.USAGE,
  permissions: [ PERMISSION.EMBED_LINKS ],
  subcommands: [
    Add, List, Remove
  ],
  execute: async ({ bot, channel, guild, msg, content }) => {
    // No multiline is allowed
    const name = content.split("\n")[0];

    if (!name) {
      return await bot.replyError(msg, ERROR.CMD.EMPTY_CONTENT(DISCHARGE.TARGET));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const info = await Discharge.findOne({
      guildID: guild.id,
      userName: name
    }).lean().exec() as DischargeDocument;

    if (!info) {
      return await bot.replyError(msg, DISCHARGE.ERROR.NOT_FOUND);
    }

    const force = info.force;
    const forceInfo = DISCHARGE.FORCE_INFO[force] as { duration: number; maxShortenMonth: number };
    const joinDate = new Date(info.joinDate);

    const details: string[] = [];
    details.push(DISCHARGE.FORCE_DETAIL(force));

    let endDate = date.addMonths(joinDate, forceInfo.duration);
    // Should subtract 1, as 2013/1/2 -> 2015/1/1, not 2015/1/2
    endDate = date.addDays(endDate, -1);

    if (endDate >= DISCHARGE.SHORTEN_AFTER_THIS_DATE) {
      const dateDiff = new DateDiff(endDate, DISCHARGE.SHORTEN_AFTER_THIS_DATE);
      // Subtract 0.1, as it ranges like 0.1 ~ 2.0
      const weekDiff = dateDiff.weeks - 0.1;
      const daysShorten = Math.floor(weekDiff / 2) + 1;
      endDate = (daysShorten <= forceInfo.maxShortenMonth * 30)
        ? date.addDays(endDate, -daysShorten)
        : date.addMonths(endDate, -forceInfo.maxShortenMonth);
    }

    const now = new Date();
    const total = Math.floor(new DateDiff(endDate, joinDate).days);
    let progressed = Math.floor(new DateDiff(now, joinDate).days);
    progressed = progressed > total ? total : progressed;

    const percentage = clamp(100 * (progressed / total), 0, 100);

    details.push(DISCHARGE.JOIN_DATE(joinDate));
    details.push(DISCHARGE.DISCHARGE_DATE(endDate));
    details.push(DISCHARGE.DAYS_PROGRESSED(Math.min(progressed, total)));
    details.push(DISCHARGE.DAYS_LEFT(Math.max(total - progressed, 0)));
    details.push(DISCHARGE.PERCENTAGE(percentage));

    const embed = new MessageEmbed()
      .setTitle(DISCHARGE.TITLE(name))
      .setDescription(DISCHARGE.PROGRESS_EMOJI(Math.floor(percentage)))
      .setColor(COLOR.BOT)
      .addField(DISCHARGE.DETAILED, details.join("\n"));

    await bot.send(channel, embed);
  }
});
