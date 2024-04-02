import { isProduction } from "@siamese/env";
import pino from "pino";

import DiscordChannelLogger from "./DiscordChannelLogger";

const logger = pino({
  base: { pid: process.pid }
}, pino.destination("./siamese.log"));

interface LogOptions {
  printToConsole: boolean;
}

const log = (obj: object | string, {
  printToConsole = false
}: Partial<LogOptions> = {}) => {
  logger.info(obj);

  if (!isProduction && printToConsole) {
    console.log(obj);
  }
};

const warn = (obj: object | string, {
  printToConsole = false
}: Partial<LogOptions> = {}) => {
  logger.warn(obj);

  if (!isProduction && printToConsole) {
    console.warn(obj);
  }
};

const error = (obj: object | string, {
  printToConsole = false
}: Partial<LogOptions> = {}) => {
  logger.error(obj);

  if (!isProduction && printToConsole) {
    console.error(obj);
  }
};

export {
  log,
  warn,
  error,
  DiscordChannelLogger
};
