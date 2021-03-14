import Josa from "josa-js";

import { dedent } from "~/util/helper";
import * as EMOJI from "~/const/emoji";
import { code } from "~/util/markdown";

export const ICON = {
  CMD: "아이콘",
  DESC: "아이콘 관리 페이지를 반환한다냥!",
  ALIAS: ["콘"],
  TITLE: (guildName: string) => `${EMOJI.LINK} ${guildName}의 아이콘 관리 페이지다냥!`,
  NAME_MAX_LENGTH: 10
};

export const ADD = {
  CMD: "추가해줘",
  DESC: "새로운 아이콘을 추가한다냥!",
  USAGE: "[그룹명] 아이콘명",
  ALIAS: ["추가"],
  REPLACE_TITLE: "이미 해당 이름을 가진 아이콘이 존재한다냥! 교체할거냥?",
  SUCCESS: (name: string) => `${Josa.r(name, "을/를")} 추가했다냥!`,
  TUTORIAL_URL: "https://cdn.discordapp.com/attachments/805419701386739722/805419755497848862/icon_add.png",
  ERROR: {
    PROVIDE_NAME_TO_ADD: `추가할 아이콘 이름을 ${code("그룹명")} ${code("아이콘명")}으로 달라냥! 그룹명은 생략 가능하다냥!`,
    PROVIDE_IMAGES: "추가할 이미지도 같이 달라냥!\n아래처럼 이미지를 추가하면서 명령어를 같이 입력하면 된다냥!",
    IMAGE_TOO_MANY: "추가할 이미지는 한 장만 달라냥!",
    GROUP_NAME_TOO_LONG: `그룹명이 너무 길다냥! ${ICON.NAME_MAX_LENGTH}자 이내로 달라냥!`,
    ICON_NAME_TOO_LONG: `아이콘 이름이 너무 길다냥! ${ICON.NAME_MAX_LENGTH}자 이내로 달라냥!`
  }
};

export const REMOVE = {
  CMD: "삭제해줘",
  DESC: "기존 아이콘을 삭제한다냥!",
  USAGE: "[그룹명] 아이콘명",
  ALIAS: ["삭제", "제거", "제거해줘"],
  SUCCESS: (name: string) => `${Josa.r(name, "을/를")} 삭제했다냥!`,
  ERROR: {
    PROVIDE_NAME_TO_REMOVE: `삭제할 아이콘 이름을 ${code("그룹명")} ${code("아이콘명")}으로 달라냥! 그룹명은 생략 가능하다냥!`,
    NOT_FOUND: "아이콘을 찾을 수 없다냥!"
  }
};

export const LIST = {
  CMD: "목록",
  DESC: dedent`
    그룹 안의 아이콘 목록을 표시한다냥!
    그룹 이름을 주지 않을 경우 그룹에 속하지 않은 아이콘들을 표시한다냥!`,
  USAGE: "그룹명",
  ITEM_PER_PAGE: 10,
  RECITAL_TIME: 30,
  TYPE: {
    GROUP: "GROUP",
    ICON: "ICON"
  },
  EMOJI: {
    GROUP: EMOJI.FILE,
    ICON: EMOJI.PICTURE
  } as const,
  ERROR: {
    NO_GROUP: "그런 이름을 가진 그룹이 존재하지 않는다냥!"
  }
};

export const ROLE = {
  CMD: "역할설정",
  DESC: "아이콘을 관리할 수 있는 역할을 설정한다냥!",
  USAGE: "[@역할명]",
  ALIAS: ["역할"],
  MSG: {
    SUCCESS_WITH_ROLE: (roleMention: string) => `이제 서버 관리자랑 ${roleMention}만 아이콘을 관리할 수 있다냥!`,
    SUCCESS_WITHOUT_ROLE: "아이콘 관리 역할을 제거했다냥! 아무나 아이콘을 관리할 수 있다냥!"
  },
  ERROR: {
    PROVIDE_EXACTLY_ONE_ROLE: `설정할 역할은 하나만 ${code("@멘션")}해서 달라냥!`,
    NO_ROLE: "그런 이름을 가진 그룹이 존재하지 않는다냥!"
  }
};
