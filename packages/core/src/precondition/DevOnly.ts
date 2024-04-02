import { env } from "@siamese/env";

import createPrecondition from "./createPrecondition";

const DevOnly = createPrecondition({
  text: msg => {
    return msg.author.id === env.BOT_DEV_USER_ID;
  },
  slash: interaction => {
    return interaction.user.id === env.BOT_DEV_USER_ID;
  }
});

export default DevOnly;
