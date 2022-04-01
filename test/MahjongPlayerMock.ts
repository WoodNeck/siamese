import MahjongGame from "../src/core/game/mahjong/MahjongGame";
import MahjongPlayer from "../src/core/game/mahjong/MahjongPlayer";

class MahjongPlayerMock extends MahjongPlayer {
  public constructor(game: MahjongGame) {
    // @ts-ignore
    super({}, game, 0);
  }
}

export default MahjongPlayerMock;
