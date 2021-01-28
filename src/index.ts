import pino from "pino";

import Siamese from "~/Siamese";
import env from "~/setup/env";
import setupAxios from "~/setup/axios";
import setupExceptions from "~/setup/exceptions";

const logger = pino({ prettyPrint: { translateTime: "SYS:standard" } }, pino.destination("./siamese.log"));

setupExceptions(logger);
setupAxios();

// Create a new bot instance, setup and start it
const bot = new Siamese({ env, logger, options: {} });

bot.setup()
  .then(() => bot.start())
  .catch(console.error);
