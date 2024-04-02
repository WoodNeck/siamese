import { EMOJI } from "@siamese/emoji";

import PlayingCard, { CARD_EMOJI, CardSymbol } from "./PlayingCard";

import type { User } from "discord.js";

export const ONECARD = {
  TAKE_PENALTY: (user: User, added: number, cardCount: number) => `${user}가 카드를 ${added}장 추가하고 턴을 넘긴다냥 (현재 카드 수: ${cardCount})`,
  HELP_TITLE: "원카드 도움말",
  HELP_DESC: [
    "들고 있는 카드를 가장 먼저 없애는 사람이 승리한다냥!",
    "자기 차례에는 같은 무늬나 같은 숫자의 카드만 낼 수 있다냥!",
    "자기 차례에 낼 카드가 없다면 카드를 한 장 추가해야 한다냥!"
  ].map(desc => `${EMOJI.MIDDLE_DOT} ${desc}`).join("\n"),
  HELP_SPECIAL_TITLE: "특수 카드들",
  HELP_SPECIAL_DESC: [
    `${CARD_EMOJI[CardSymbol.SPADE]} 숫자 7 - 원하는 무늬로 변경할 수 있다냥`,
    `${CARD_EMOJI[CardSymbol.SPADE]} J - 한 사람을 건너 뛴다냥`,
    `${CARD_EMOJI[CardSymbol.SPADE]} Q - 진행 방향을 반대로 변경한다냥`,
    `${CARD_EMOJI[CardSymbol.JOKER]} 숫자 2, A, Joker - 공격 카드, 상대방의 공격은 더 강한 카드로만 막을 수 있으며, 막을 카드가 없으면 여러 장의 카드를 받게 된다냥 (각각 2장, 3장, 5장 추가)`
  ].join("\n"),
  HELP_DEFEAT_TITLE: "파산 조건",
  HELP_DEFEAT_DESC: [
    "플레이어 수에 따라 다음 카드 개수 이상의 카드를 보유하게 되면 파산하며, 자동으로 패배한다냥",
    `${CARD_EMOJI[CardSymbol.DIAMOND]} 2명 - 20장`,
    `${CARD_EMOJI[CardSymbol.HEART]} 3명 - 19장`,
    `${CARD_EMOJI[CardSymbol.CLUB]} 4명 - 14장`
  ].join("\n"),
  INITIAL_CARD: 5,
  CARD_LEFT: (count: number) => `남은 카드 수: ${count}`,
  TURN_HEADER: (player: User) => `${player}냥, 낼 카드를 선택해달라냥!`,
  CHANGE_HEADER: (player: User) => `${player}냥, 바꿀 무늬를 선택해달라냥!`,
  WINNER_HEADER: (winner: User, lastCard: PlayingCard) => `${EMOJI.TROPHY} ${winner.displayName}의 승리다냥! (${lastCard.getEmoji()}${lastCard.getName()})`,
  LABEL: {
    DEFEATED: "파산",
    SKIP: (count: number) => `${count}장 먹기`
  }
} as const;
