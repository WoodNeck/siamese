import * as Discord from "discord.js";

import * as EMOJI from "~/const/emoji";

export const YACHT = {
  CMD: "요트",
  DESC: "요트(Yacht) 게임을 할 수 있다냥! 같이 플레이하고 싶은 상대방을 지정하거나, 아무나 참가하길 원한다면 그냥 사용하면 된다냥!",
  OPPONENT: {
    NAME: "상대",
    DESC: "같이 플레이할 사람을 지정한다냥"
  },
  ICON: "https://cdn.discordapp.com/attachments/817765838001668116/897469454307459092/game_die.png",
  RECEIVE_DURATION_MINUTE: 1,
  MSGS: {
    RECEIVE_TITLE: (author: Discord.GuildMember) => `${author.displayName}님이 ${EMOJI.DICE}요트를 같이 할 상대를 찾고 있다냥! (1/2)`,
    OPPONENT_RECEIVE_FOOTER: (opponent: Discord.GuildMember) => `${opponent.displayName}님을 상대로 지목했다냥! ${EMOJI.GREEN_CHECK} 버튼을 눌러 승낙하라냥! (${EMOJI.STOPWATCH}${YACHT.RECEIVE_DURATION_MINUTE}분)`,
    EVERYONE_RECEIVE_FOOTER: () => `서버 내의 누구든 같이 할 수 있다냥! 같이 할 사람은 ${EMOJI.GREEN_CHECK} 버튼을 눌러달라냥! (${EMOJI.STOPWATCH}${YACHT.RECEIVE_DURATION_MINUTE}분)`,
    NO_PERMISSION_TO_ENTER: "이 게임에는 참여할 수 없다냥!",
    NO_PERMISSION: "그럴 권한이 없다냥!",
    ALREADY_OCCUPIED: (user: Discord.GuildMember) => `${user.displayName}님이 먼저 자리를 차지했다냥!`,
    ALREADY_IN: "이미 참가했다냥!",
    FAILED_BY_TIME: () => `${YACHT.RECEIVE_DURATION_MINUTE}분 동안 아무도 참가하지 않아 종료되었다냥`,
    JOIN: "같이하기",
    DECLINED: (isAuthor: boolean) => isAuthor ? "취소되었다냥" : "상대방이 거절했다냥"
  },
  ID: {
    ACCEPT: "accept",
    DECLINE: "decline",
    FAILED: "failed"
  },
  END_REASON: {
    ALL_ACCEPTED: "allAccepted",
    DECLINE: "decline"
  }
} as const;
