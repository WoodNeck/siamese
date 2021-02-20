/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TextChannel } from "discord.js";

import Siamese from "~/Siamese";

export default async (bot: Siamese, channel: TextChannel) => {
  const endpoint = (bot as any).api.channels[channel.id].typing;

  return endpoint.post() as Promise<void>;
};
