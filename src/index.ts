import pino from "pino";
import env from "~/load/env";
import Siamese from "~/Siamese";

const logger = pino({ prettyPrint: { translateTime: "SYS:standard" } }, pino.destination("./siamese.log"));

// Create a new bot instance, setup and start it
const bot = new Siamese(env, {
  presence: {
    activity: {
      name: "Nekopara Vol 1.",
      type: "PLAYING",
      url: env.BOT_GITHUB_URL
    }
  }
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
  logger.error("Unhandled rejection at ", promise, `reason: ${reason}`);
  process.exit(1);
});

bot.setup()
  .then(() => bot.start())
  .catch(console.error);
