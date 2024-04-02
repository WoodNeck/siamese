import type Bot from "../Bot";

const onError = async (bot: Bot, err: Error) => {
  await bot.logger.error(err);
};

export default onError;
