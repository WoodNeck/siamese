import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { IMAGE } from "~/const/command/search";

export default new Command({
  name: IMAGE.CMD,
  description: IMAGE.DESC,
  usage: IMAGE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(3),
  beforeRegister: (bot: Siamese) => bot.env.GOOGLE_SEARCH_ENGINE_ID != null && bot.env.GOOGLE_API_KEY != null,
  slashData: new SlashCommandBuilder()
    .setName(IMAGE.CMD)
    .setDescription(IMAGE.DESC)
    .addStringOption(option => option
      .setName(IMAGE.USAGE)
      .setDescription(IMAGE.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, channel } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(IMAGE.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    const searchText = content;
    const images = await searchGoogleImage(searchText, {
      safe: !channel.nsfw,
      additional_params: IMAGE.SEARCH_PARAMS(!channel.nsfw)
    });

    if (!images.length) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_RESULT(IMAGE.TARGET));
    }

    const pages = images.map(image => new MessageEmbed().setImage(image.url));
    const menu = new Menu(ctx);

    menu.setPages(pages);

    await menu.start();
  }
});

// from https://github.com/LuanRT/google-this/blob/7e422b302fdded39562e8d5d1cdcfda25d06ea1f/lib/core/main.js
// MIT Licensed
const searchGoogleImage = async (query: string, {
  safe,
  additional_params
}: {
  safe: boolean;
  additional_params: Record<string, any>;
}) => {
  const form_data = new URLSearchParams();

  const payload = [
    [
      [
        "HoAMBc",
        JSON.stringify([
          null, null, [
            0, null, 2529, 85, 2396,
            [], [9429, 9520], [194, 194],
            false, null, null, 9520
          ],
          null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null, null,
          null, null, null, null, null, null, null, null,
          null, [
            query
          ],
          null, null, null,
          null, null, null,
          null, null, [
            null, "CAE=", "GGwgAA=="
          ], null, true
        ]),
        null,
        "generic"
      ]
    ]
  ];

  form_data.append("f.req", JSON.stringify(payload));
  form_data.append("at", `${generateRandomString(29)}:${Date.now()}`);

  const params = {
    ...additional_params
  };

  if (safe) {
    params.safe = "active";
  }

  const response = await axios.post("https://www.google.com/_/VisualFrontendUi/data/batchexecute", form_data, {
    params: {
      "rpcids": "HoAMBc",
      "source-path": "/search",
      "f.sid": -getRandomInt(0, 9e10),
      "bl": "boq_visualfrontendserver_20220505.05_p0",
      "hl": "en",
      "authuser": 0,
      "_reqid": -getRandomInt(0, 9e5),
      ...params
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      ...getHeaders()
    }
  }).catch((err) => err);

  if (response instanceof Error)
    throw new Error("Could not execute search");

  const res = "[null" + (getStringBetweenStrings(response.data, "\"[null", "]\"") || "") + "]";
  const data = JSON.parse(res.replace(/\\"/g, "\"").replace(/\\\\"/g, "'"));

  if (data.length <= 1)
    throw new Error("Got unexpected response from BatchExecute API");

  if (!data[56]?.[1])
    throw new Error(data[53]?.[1] || "Unexpected response structure");

  const items = data[56]?.[1]?.[0]?.[0]?.[1]?.[0];

  if (!items)
    throw new Error("Unexpected response structure");

  const results = items.map((el) => {
    const item = el[0]?.[0]?.["444383007"]; // TODO: refactor this

    if (!item?.[1])
      return;

    const image_data = item[1]?.filter((e) => Array.isArray(e));

    const image = image_data?.[1];
    const preview = image_data?.[0];

    const origin = item[1]?.find((e) => e?.[2001]);

    if (image && preview && origin)
      try {
        return {
          url: decodeURIComponent(JSON.parse("\"" + image[0].replace(/"/g, "\"") + "\""))
        };
      } catch {
        return {
          url: image[0]
        };
      }
  }).filter((item) => item);

  return results;
};

/**
 * Returns headers with a random user agent.
 *
 * @param {boolean} is_mobile
 * @returns {string}
 */
const getHeaders = () => {
  const ua = IMAGE.USER_AGENTS[Math.floor(Math.random() * IMAGE.USER_AGENTS.length)];

  return {
    "accept": "text/html",
    "accept-encoding": "gzip, deflate",
    "accept-language": "en-US,en",
    "referer": "https://www.google.com/",
    "upgrade-insecure-requests": 1,
    "user-agent": ua
  };
};

/**
 * Generates a random string with a given length.
 * @param {number} length
 * @returns {string}
 */
const generateRandomString = (length) => {
  const result: string[] = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  for (let i = 0; i < length; i++) {
    result.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
  }

  return result.join("");
};

/**
 * Returns a random integer between two values.
 *
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

/**
 * Gets a string between two delimiters.
 *
 * @param {string} data - The data.
 * @param {string} start_string - Start string.
 * @param {string} end_string - End string.
 *
 * @returns {string}
 */
function getStringBetweenStrings(data, start_string, end_string) {
  const regex = new RegExp(`${escapeStringRegexp(start_string)}(.*?)${escapeStringRegexp(end_string)}`, "s");
  const match = data.match(regex);
  return match ? match[1] : undefined;
}

function escapeStringRegexp(string) {
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
