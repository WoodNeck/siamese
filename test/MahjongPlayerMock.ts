import MahjongPlayer from "../src/core/game/mahjong/MahjongPlayer";

class MahjongPlayerMock extends MahjongPlayer {
  public constructor() {
    // @ts-ignore
    super({}, 0);
  }
}

export default MahjongPlayerMock;
