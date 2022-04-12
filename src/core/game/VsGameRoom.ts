import { GuildMember, MessageComponentInteraction, ThreadChannel } from "discord.js";
import PhraseGen from "korean-random-words";

import CommandContext from "../CommandContext";
import SlashCommandContext from "../SlashCommandContext";

import GameRoom from "./GameRoom";

import { createGameChannel } from "~/command/minigame/utils";

class VsGameRoom {
  private _ctx: CommandContext | SlashCommandContext;
  private _threadChannel: ThreadChannel;
  private _players: Array<{
    user: GuildMember;
    interaction: MessageComponentInteraction | null;
  }>;

  public get players() { return this._players; }
  public get threadChannel() { return this._threadChannel; }

  public constructor(ctx: CommandContext | SlashCommandContext, opponent: GuildMember | null) {
    const { author } = ctx;
    const players = [author];

    if (opponent) players.push(opponent);

    this._ctx = ctx;
    this._players = players.map(player => ({
      user: player,
      interaction: null
    }));
  }

  public async waitForPlayers(gameName: string, joinTitle: string): Promise<boolean> {
    const ctx = this._ctx;
    const players = this._players;
    const id = new PhraseGen().generatePhrase();

    this._threadChannel = await createGameChannel(ctx, gameName, players.map(({ user }) => user), id);

    if (!this._threadChannel) return false;
    if (players.length >= 2) return true;

    const game = new GameRoom(ctx, 2, 2);
    const canStart = await game.waitForPlayers(joinTitle, this._threadChannel);

    this._players = game.players;

    return canStart;
  }
}

export default VsGameRoom;
