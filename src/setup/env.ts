import fs from "fs";
import path from "path";

import { typetest, validator } from "~/util/typetest";
import EnvVariables from "~/type/EnvVariables";

const env: Partial<EnvVariables> = {};

// env file exists at root folder with name 'bot.env'
fs.readFileSync(path.join(__dirname, "../..", "bot.env"), "utf8")
  .split("\n")
  .filter(line => line && !line.startsWith("#"))
  .forEach(line => {
    const [key, val] = line.split("=");
    env[key] = val.replace(/^"(.+(?="$))"$/, "$1");
  });

const essentialConfigs = {
  BOT_TOKEN: validator.notEmptyStr,
  BOT_DEFAULT_PREFIX: validator.notEmptyStr,
  BOT_ICON_PREFIX: validator.notEmptyStr,
  BOT_ENV: validator.envStr,
  BOT_CLIENT_ID: validator.notEmptyStr,
  BOT_CLIENT_SECRET: validator.notEmptyStr,
  SERVER_DOMAIN: validator.notEmptyStr,
  WEB_URL_BASE: validator.notEmptyStr,
  SESSION_SECRET: validator.notEmptyStr,
  ICON_CHANNEL_ID: validator.notEmptyStr
};
typetest(env, essentialConfigs);

export default Object.freeze(env) as Readonly<EnvVariables>;
