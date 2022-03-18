import { Intents } from "discord.js";

const botIntents = [
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_BANS,
  Intents.FLAGS.GUILD_VOICE_STATES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS
];

export default botIntents;
