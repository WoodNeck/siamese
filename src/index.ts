import pino from "pino";

import Siamese from "~/Siamese";
import env from "~/setup/env";
import setupAxios from "~/setup/axios";
import setupExceptions from "~/setup/exceptions";
import startRestServer from "~/rest/start";

const logger = pino({ prettyPrint: { translateTime: "SYS:standard" } }, pino.destination("./siamese.log"));

setupExceptions(logger);
setupAxios();

// Create a new bot instance, setup and start it
const bot = new Siamese({ env, logger, options: {} });

const start = async () => {
  await bot.setup();
  await bot.start();

  startRestServer(bot);
};

void start();
