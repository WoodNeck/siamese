import { GuildMember, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, ThreadChannel } from "discord.js";

import { GAME } from "~/const/command/minigame";
import { BUTTON_STYLE, MAX_INTERACTION_DURATION } from "~/const/discord";

class Reconnector {
  public shouldReconnect(player: { interaction: MessageComponentInteraction }): boolean {
    return Date.now() - player.interaction.createdTimestamp >= MAX_INTERACTION_DURATION;
  }

  public async run(channel: ThreadChannel, players: Array<{
    user: GuildMember;
    interaction: MessageComponentInteraction;
  }>) {
    const row = new MessageActionRow();
    const btn = new MessageButton();

    btn.setLabel(GAME.RECONNECT_LABEL);
    btn.setStyle(BUTTON_STYLE.SUCCESS);
    btn.setCustomId(GAME.SYMBOL.RECONNECT);
    row.addComponents(btn);

    const playersLeft = [...players];
    const embed = new MessageEmbed();

    embed.setTitle(GAME.RECONNECT_LIST_TITLE);
    embed.setDescription(playersLeft.map(player => player.user.toString()).join("\n"));

    const reconnectMsg = await channel.send({
      content: GAME.RECONNECT_TITLE(players.map(player => player.user)),
      embeds: [embed],
      components: [row]
    });

    const collector = reconnectMsg.createMessageComponentCollector({
      filter: action => playersLeft.findIndex(player => action.user.id === player.user.id) >= 0,
      time: 10 * 60 * 1000
    });

    collector.on("collect", async action => {
      const pressedPlayer = playersLeft.splice(playersLeft.findIndex(player => player.user.id === action.user.id), 1)[0];

      embed.setDescription(playersLeft.map(player => player.user.toString()).join("\n"));
      await action.update({
        embeds: [embed],
        components: playersLeft.length > 0
          ? [row]
          : []
      });
      pressedPlayer.interaction = action;

      if (playersLeft.length <= 0) {
        collector.stop(GAME.SYMBOL.RECONNECT);
      }
    });

    return new Promise<boolean>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.RECONNECT) {
          await channel.send({
            content: GAME.RECONNECT_COMPLETE
          });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}

export default Reconnector;
