import { COLOR } from "@siamese/color";
import { Command, CommandContext, GuildTextOnly } from "@siamese/core";
import { Discharge as DischargeModel } from "@siamese/db";
import { EmbedBuilder } from "@siamese/embed";
import { clamp } from "@siamese/util";
import dayjs from "dayjs";

import { DISCHARGE } from "./const";
import DischargeAdd from "./sub/DischargeAdd";
import DischargeList from "./sub/DischargeList";
import DischargeRemove from "./sub/DischargeRemove";
import DischargeShow from "./sub/DischargeShow";

class Discharge extends Command {
  public static async execute({ sender, getParams, getGuildID }: CommandContext) {
    const [name] = getParams<typeof DISCHARGE.USAGE>();

    if (!name) {
      await sender.replyError(DISCHARGE.ERROR.EMPTY_CONTENT);
      return;
    }

    const guildID = getGuildID();
    if (!guildID) {
      await sender.replyError(DISCHARGE.ERROR.GUILD_NOT_FOUND);
      return;
    }

    const info = await DischargeModel.find(name, guildID);

    if (!info) {
      await sender.replyError(DISCHARGE.ERROR.NOT_FOUND);
      return;
    }

    const force = info.force;
    const forceInfo = DISCHARGE.FORCE_INFO[force];
    const joinDate = dayjs(info.joinDate);

    const details: string[] = [];
    details.push(DISCHARGE.FORCE_DETAIL(force));

    // Should subtract 1, as 2013/1/2 -> 2015/1/1, not 2015/1/2
    let endDate = joinDate
      .add(forceInfo.duration, "month")
      .subtract(1, "day");

    if (endDate.isAfter(DISCHARGE.SHORTEN_AFTER_THIS_DATE)) {
      const weekDiff = endDate.diff(DISCHARGE.SHORTEN_AFTER_THIS_DATE, "week");
      const daysShorten = Math.floor(weekDiff / 2) + 1;

      endDate = (daysShorten <= forceInfo.maxShortenMonth * 30)
        ? endDate.subtract(daysShorten, "day")
        : endDate.subtract(forceInfo.maxShortenMonth, "month");
    }

    const now = dayjs();
    const total = endDate.diff(joinDate, "day");
    const progressed = Math.min(now.diff(joinDate, "day"), total);

    const percentage = clamp(100 * (progressed / total), 0, 100);

    details.push(DISCHARGE.JOIN_DATE(joinDate));
    details.push(DISCHARGE.DISCHARGE_DATE(endDate));
    details.push(DISCHARGE.DAYS_PROGRESSED(Math.min(progressed, total)));
    details.push(DISCHARGE.DAYS_LEFT(Math.max(total - progressed, 0)));
    details.push(DISCHARGE.PERCENTAGE(percentage));

    const embed = new EmbedBuilder()
      .setTitle(DISCHARGE.TITLE(name))
      .setDescription(DISCHARGE.PROGRESS_EMOJI(Math.floor(percentage)))
      .setColor(COLOR.BOT)
      .addField(DISCHARGE.DETAILED, details.join("\n"));

    await sender.send(embed);
  }

  public override define() {
    return {
      data: DISCHARGE,
      preconditions: [
        GuildTextOnly
      ],
      subcommands: [
        new DischargeAdd(),
        new DischargeList(),
        new DischargeRemove(),
        new DischargeShow()
      ]
    };
  }

  public override async execute(ctx: CommandContext) {
    return await Discharge.execute(ctx);
  }
}

export default Discharge;
