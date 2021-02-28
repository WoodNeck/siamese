import Josa from "josa-js";

export const URL = {
  LOGOUT: "/logout",
  USER: "/user",
  GUILDS: "/guilds",
  ICON: "/icon",
  ICONS: "/icons",
  DIRECTORY: "/directory",
  DIRECTORIES: "/directories"
} as const;

export const ERROR = {
  INVALID_ARGUMENTS: "인자가 잘못되었습니다.",
  UNAUTHORIZED: "길드에 스탬프관리 권한이 없습니다.",
  NOT_EXISTS: thing => `${Josa.r(thing, "이/가")} 존재하지 않습니다.`,
  ALREADY_EXISTS: thing => `이미 동일한 이름의 ${Josa.r(thing, "이/가")} 존재합니다.`,
  FAILED_TO_CREATE: thing => `${thing} 생성에 실패했습니다.`,
  FAILED_TO_CHANGE: thing => `${thing} 변경에 실패했습니다.`,
  FAILED_TO_REMOVE: thing => `${thing} 삭제에 실패했습니다.`
} as const;
