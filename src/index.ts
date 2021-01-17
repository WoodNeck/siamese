import pino from "pino";
import env from "~/load/env";
import Siamese from "~/Siamese";

const logger = pino({ prettyPrint: { translateTime: "SYS:standard" } }, pino.destination("./siamese.log"));

// Create a new bot instance, setup and start it
const bot = new Siamese({
  env,
  logger,
  options: {}
});


// Exceptions
process.on("beforeExit", code => {
  logger.info(`Process will exit with code: ${code}`);
});

process.on("exit", code => {
  logger.info(`Process exited with code: ${code}`);
});

process.on("SIGTERM", () => {
  logger.info(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info(`Process ${process.pid} has been interrupted`);
  process.exit(0);
});

process.on("uncaughtException", err => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  logger.error(`Unhandled rejection at ${(reason as any).stack || reason}`);
  process.exit(1);
});

bot.setup()
  .then(() => bot.start())
  .catch(console.error);
