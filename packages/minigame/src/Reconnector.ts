import { ButtonBuilder } from "@siamese/button";
import { EmbedBuilder } from "@siamese/embed";
import { ThreadSender } from "@siamese/sender";
import { ButtonStyle } from "discord.js";

import { GAME } from "./const";

import type { GamePlayer } from "./GamePlayer";

export const MAX_INTERACTION_DURATION = 900000 - 30000; // 15min - 30sec

class Reconnector {
  public shouldReconnect({ interaction }: GamePlayer): boolean {
    if (!interaction) return true;

    return Date.now() - interaction.createdTimestamp >= MAX_INTERACTION_DURATION;
  }

  public async reconnectPlayers(sender: ThreadSender, players: GamePlayer[]) {
    const buttons = new ButtonBuilder();

    buttons.addButton({
      label: GAME.RECONNECT_LABEL,
      style: ButtonStyle.Success,
      id: GAME.SYMBOL.RECONNECT
    });

    const playersLeft = [...players];
    const embed = new EmbedBuilder();

    embed.setTitle(GAME.RECONNECT_LIST_TITLE);
    embed.setDescription(playersLeft.map(player => player.user.toString()).join("\n"));

    const reconnectMsg = await sender.sendObject({
      content: GAME.RECONNECT_TITLE(players.map(player => player.user)),
      embeds: [embed.build()],
      components: buttons.build()
    });

    const { reason } = await reconnectMsg.watchBtnClick({
      filter: action => playersLeft.findIndex(player => action.user.id === player.user.id) >= 0,
      maxWaitTime: 10 * 60,
      onCollect: async ({ sender, interaction, collector }) => {
        const pressedPlayer = playersLeft.splice(playersLeft.findIndex(player => player.user.id === interaction.user.id), 1)[0];

        embed.setDescription(playersLeft.map(player => player.user.toString()).join("\n"));

        await sender.editObject({
          embeds: [embed.build()],
          components: playersLeft.length > 0
            ? buttons.build()
            : []
        });
        pressedPlayer.interaction = interaction;

        if (playersLeft.length <= 0) {
          collector.stop(GAME.SYMBOL.RECONNECT);
        }
      }
    });

    if (reason === GAME.SYMBOL.RECONNECT) {
      await sender.send(GAME.RECONNECT_COMPLETE);
    } else {
      // 에러스택 생성하지 않고 string을 throw
      throw GAME.SYMBOL.RECONNECT_FAILED;
    }
  }
}

export default Reconnector;
