// For require module alias, this should be required
// check package.json/_moduleAliases
import "module-alias/register";

// Load env file first before any of file, to load constants correctly
import env from "~/load/env";

// // Load all prototype redefinitions
// require("~/load/prototype");

import Bot from "~/bot";

// Create a new bot instance, setup and start it
const bot = new Bot(env, {
  presence: {
    activity: {
      name: "Nekopara Vol 1.",
      type: "PLAYING",
      url: env.BOT_GITHUB_URL,
    }
  }
});

bot.setup()
	.then(() => bot.start())
	.catch(console.error);
