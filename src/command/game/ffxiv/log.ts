import { MessageEmbed } from "discord.js";
import axios from "axios";
import * as cheerio from "cheerio";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu, { MENU_END_REASON } from "~/core/Menu";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { FFXIV } from "~/const/command/game";

export default new Command({
  name: FFXIV.LOG.CMD,
  description: FFXIV.LOG.DESC,
  usage: FFXIV.LOG.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(FFXIV.LOG.CMD)
    .setDescription(FFXIV.LOG.DESC)
    .addStringOption(option => option
      .setName(FFXIV.LOG.USAGE)
      .setDescription(FFXIV.LOG.USAGE_DESC)
      .setRequired(true)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const searchText = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(FFXIV.LOG.USAGE, true)
      : ctx.content;

    if (!searchText) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    // Search character entries first
    const entries = await axios.get(FFXIV.LOG.CHAR_SEARCH_ENDPOINT, {
      params: {
        term: searchText
      },
      headers: FFXIV.LOG.REQUEST_HEADERS
    }).then(res => res.data.filter(entry => entry.type === FFXIV.LOG.CHAR_TYPE));

    if (entries.length <= 0) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(FFXIV.ITEM.CMD));
    }

    if (entries.length > 1) {
      // Show select menu
      const pages = entries.map(item => {
        const page = new MessageEmbed();

        page.setTitle(item.label);
        page.setColor(COLOR.BOT);
        page.setDescription(item.server);
        page.setThumbnail(FFXIV.LOG.PERSON_ICON_URL);

        return page;
      });
      const menu = new Menu(ctx);

      menu.setPages(pages);
      menu.addReactionCallback({ id: "CONFIRM", emoji: EMOJI.GREEN_CHECK, style: "SECONDARY" }, () => {
        void showLog(ctx, entries[menu.index]);

        return MENU_END_REASON.DELETE_ALL;
      }, 1);

      await menu.start();
    } else {
      void showLog(ctx, entries[0]);
    }
  }
});

const showLog = async (ctx: CommandContext | SlashCommandContext, {
  label: name,
  server,
  link
}: {
  label: string;
  server: string;
  link: string;
}) => {
  const { bot, channel } = ctx;
  const playerName = `${name} / ${server}`;

  void channel.sendTyping().catch(() => void 0);

  const res = await getZoneAndID(link);

  if (!res) {
    return await bot.replyError(ctx, ERROR.SEARCH.FAILED);
  }

  const { zones, id: charID } = res;
  const zoneDatas = (await Promise.all(zones.map(zone => getZoneInfo(zone, charID))))
    .filter(val => !!val);

  if (zoneDatas.length <= 0) {
    return await bot.replyError(ctx, ERROR.SEARCH.FAILED);
  }

  const zoneEmbeds = zoneDatas.map(({
    zone,
    summary,
    summaryCol,
    jobThumb,
    bosses
  }: NonNullable<typeof zoneDatas[0]>) => {
    const embed = new MessageEmbed();

    embed.setDescription(`**${zone.name}**\n${summary}`);

    if (jobThumb) {
      embed.setAuthor({
        name: playerName,
        iconURL: jobThumb
      });
    } else {
      embed.setTitle(playerName);
    }

    if (summaryCol) {
      embed.setColor(summaryCol);
    }

    embed.setThumbnail(FFXIV.LOG.ZONE_THUMB_URL(zone.id));

    bosses.forEach(boss => {
      embed.addField(boss.name, `${boss.bestJob} / 최고 %: ${boss.bestScore} / 평균 %: ${boss.med}\nRDPS: ${boss.rdps} / ${EMOJI.SKULL}: ${boss.kills} / ${EMOJI.STOPWATCH}: ${boss.fastest}`);
    });

    embed.setFooter({ text: FFXIV.LOG.ZONE_INFO_FOOTER });

    return embed;
  });

  const menu = new Menu(ctx);

  menu.setPages(zoneEmbeds);

  await menu.start();
};

const getZoneAndID = async (link: string): Promise<{
  id: string;
  zones: Array<{ id: string; name: string }>;
} | null> => {
  try {
    const html = await axios.get(link).then(res => res.data);

    if (!html) return null;

    const $ = cheerio.load(html);
    const zoneWrapper = $("#filter-zone-selection-container");

    if (zoneWrapper.length <= 0) return null;

    const zoneList = zoneWrapper.find("ul");

    if (zoneList.length <= 0) return null;

    const zones = zoneList.find("li").toArray().map(el => {
      const element = $(el);
      const anchor = element.find("a");
      const zoneID = (anchor[0]?.attribs.id ?? "").split("-")[1];

      if (!zoneID) return null;

      return {
        id: zoneID,
        name: element.text().trim()
      };
    }).filter(val => !!val);

    const charIDResult = /^var characterID = (\d+)/m.exec(html);

    if (!charIDResult) return null;

    return {
      id: charIDResult[1],
      zones: zones as Array<{ id: string; name: string }>
    };
  } catch (err) {
    return null;
  }
};

const getZoneInfo = async (zone: { id: string; name: string }, charID: string) => {
  const zoneURL = FFXIV.LOG.ZONE_INFO_URL(zone.id, charID);

  try {
    const html = await axios.get(zoneURL, {
      params: {
        dpstype: "rdps"
      },
      headers: FFXIV.LOG.REQUEST_HEADERS
    }).then(res => res.data);

    const $ = cheerio.load(html);
    const topStats = $(".stats");

    const bestPerf = topStats.find(".best-perf-avg").text().trim().replace(/\n{1,}/g, " ");
    const medianPerf = topStats.find(".median-perf-avg").text().trim().replace(/\n/, " ");
    const summary = `${bestPerf}\n${medianPerf}`;
    const summaryCol = FFXIV.LOG.COLOR[topStats.find("b")[0]?.attribs.class ?? ""];

    const jobThumb = $(".asp-list .top-box-asp img").attr("src");

    const bossTable = $(".boss-table");
    const bossEls = bossTable.find("tbody tr");

    const bosses = bossEls.toArray().map(el => {
      const element = $(el);
      const iconEl = element.find(".boss-icon")[0];
      const name = iconEl?.attribs.alt;

      const tds = element.children();
      const bestEl = tds[1];
      const bestJob = (bestEl.childNodes[1] as any).attribs?.alt;
      const bestScore = $(bestEl).text().trim();

      const rdps = $(tds[2]).text().trim();
      const kills = $(tds[3]).text().trim();
      const fastest = $(tds[4]).text().trim();
      const med = $(tds[5]).text().trim();

      return {
        name,
        bestScore,
        bestJob,
        rdps,
        kills,
        fastest,
        med
      };
    });

    return {
      zone,
      jobThumb,
      summary,
      summaryCol,
      bosses
    };
  } catch (err) {
    return null;
  }
};
