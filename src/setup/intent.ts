import { Intents } from "discord.js";

const botIntents = new Intents(Intents.NON_PRIVILEGED);
botIntents.remove([
  "GUILD_BANS",
  "GUILD_INTEGRATIONS",
  "GUILD_WEBHOOKS",
  "GUILD_INVITES",
  "GUILD_MESSAGE_TYPING",
  "DIRECT_MESSAGES",
  "DIRECT_MESSAGE_REACTIONS",
  "DIRECT_MESSAGE_TYPING"
]);

export default botIntents;
