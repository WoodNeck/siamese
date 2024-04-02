enum VSGameState {
  /**
   * 현재 게임 진행중
   */
  PLAYING = "PLAYING",
  /**
   * 승자가 정해져서 종료됨
   */
  FINISHED = "FINISHED",
  /**
   * 한쪽의 플레이어가 항복하여 종료됨
   */
  SURRENDERED = "SURRENDERED",
  /**
   * 한쪽의 플레이어가 반응하지 않아 종료됨
   */
  TIMEOUT = "TIMEOUT"
}

export default VSGameState;
