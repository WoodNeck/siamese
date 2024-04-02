import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { OAuth2Scopes, PermissionsBitField } from "discord.js";

import { INVITE } from "./const";

class Invite extends Command {
  public override define() {
    return {
      data: INVITE,
      sendTyping: false,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ bot, sender, getBotName }: CommandContext) {
    const botName = getBotName();

    const permissions = new PermissionsBitField();
    bot.permissions.forEach(permission => {
      permissions.add(permission.flag);
    });

    const link = bot.client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions
    });

    const botAvatar = bot.client.user.displayAvatarURL();
    const embed = new EmbedBuilder({
      author: {
        name: INVITE.TITLE(botName),
        iconURL: botAvatar
      },
      description: `[${INVITE.MSG(botName)}](${link})`,
      color: COLOR.BOT
    });

    await sender.send(embed);
  }
}

export default Invite;
