import { StringUsage, type CommandOptions } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { stripIndents } from "common-tags";
import Josa from "josa-js";

import { CATEGORY } from "../../const/category";

import type { Channel } from "discord.js";

export const JOIN = {
  CMD: "들어와",
  DESC: "현재 명령어 사용자가 있는 음성 채널에 접속한다냥!",
  CATEGORY: CATEGORY.VOICE,
  CONNECTED: (channel: Channel) => `${channel}에 접속했다냥!`
} satisfies CommandOptions;

export const LEAVE = {
  CMD: "나가",
  DESC: "현재 접속해있는 음성 채널에서 나간다냥!",
  CATEGORY: CATEGORY.VOICE,
  DISCONNECTED: (channel: Channel) => `${channel}에서 나갔다냥!`
} satisfies CommandOptions;

export const TTS = {
  CMD: "말해줘",
  DESC: "주어진 문장을 음성 채널에서 읽는다냥!",
  CATEGORY: CATEGORY.VOICE,
  USAGE: [
    new StringUsage({
      name: "문장",
      description: "읽을 문장을 달라냥!"
    })
  ] as const,
  ALIASES: [
    "tts",
    "TTS",
    "읽어줘"
  ],
  NO_TEXT_TO_READ: "읽을 문장을 같이 달라냥!"
} satisfies CommandOptions;

export const TTS_SETTINGS = {
  CMD: "설정",
  DESC: "TTS(말해줘) 명령어의 설정을 변경한다냥",
  CATEGORY: CATEGORY.VOICE,
  DEMO_URL: "",
  SPEAKER_SELECT_TITLE: `${EMOJI.SPEAKING_HEAD} 목소리를 선택하라냥!`,
  SPEAKER_SELECT_DESC: stripIndents`
    어떤걸 골라야할지 모르겠냥?
    [네이버 CLOVA Voice 데모 페이지](https://www.ncloud.com/product/aiService/clovaVoice)에 가서 목소리를 테스트해보라냥!
    한국어가 아닌 목소리를 선택한 뒤에 한국어 텍스트를 재생하려고 할 경우, 오류가 발생할 수 있으니 주의하라냥!
  `,
  CONFIG_SELECT_TITLE: `${EMOJI.GEAR} 목소리 설정을 선택하라냥!`,
  CONFIG_SELECT_DESC: stripIndents`
    - 음색: 0보다 크면 높은 음색, 0보다 작으면 낮은 음색을 사용한다냥!
    - 끝음 처리: 0보다 크면 문장 끝을 올리고, 0보다 작으면 문장 끝을 내린다냥!
    - 끝음 처리는 일부 목소리에서만 사용할 수 있다냥!
    - 지원되는 목소리를 알고 싶다면 [공식 문서](https://api.ncloud-docs.com/docs/ai-naver-clovavoice-ttspremium#%EC%9A%94%EC%B2%AD-%ED%8C%8C%EB%9D%BC%EB%AF%B8%ED%84%B0)를 참고하라냥!
  `,
  EMOTION_SELECT_TITLE: `${EMOJI.HAPPY} 목소리의 감정을 선택하라냥!`,
  EMOTION_SELECT_DESC: stripIndents`
    감정은 일부 목소리에서만 지원된다냥!
    지원되는 목소리를 알고 싶다면 [공식 문서](https://api.ncloud-docs.com/docs/ai-naver-clovavoice-ttspremium#%EC%9A%94%EC%B2%AD-%ED%8C%8C%EB%9D%BC%EB%AF%B8%ED%84%B0)를 참고하라냥!
  `,
  MAX_LISTEN_TIME: 5 * 60, // 5분
  ID: {
    VOLUME: "volume",
    SPEED: "speed",
    PITCH: "pitch",
    ALPHA: "alpha",
    END_PITCH: "endPitch",
    EMOTION: "emotion",
    EMOTION_STRENGTH: "emotionStrength"
  },
  VOLUME_LABEL: (scale: number) => `볼륨: x${scale}`,
  VOLUME_DESC: (scale: number) => `볼륨을 ${scale}배로 설정한다냥!`,
  SPEED_LABEL: (scale: number) => `재생 속도: x${scale}`,
  SPEED_DESC: (scale: number) => `음성 재생 속도를 ${scale}배로 설정한다냥!`,
  PITCH_LABEL: (scale: number) => `피치: x${scale}`,
  PITCH_DESC: (scale: number) => `음성 피치를 ${scale}배로 설정한다냥!`,
  ALPHA_LABEL: (val: number) => `음색: ${val}`,
  ALPHA_DESC: (val: number) => `음색을 "${val}"로 설정한다냥!`,
  END_PITCH_LABEL: (val: number) => `끝음 처리: ${val}`,
  END_PITCH_DESC: (val: number) => `끝음 처리를 "${val}"로 설정한다냥!`,
  EMOTION_LEVELS: [
    "중립",
    "슬픔",
    "기쁨",
    "분노"
  ],
  EMOTION_DESC: (emotion: string) => `감정을 "${emotion}"${Josa.c(emotion, "으로/로")} 설정한다냥!`,
  EMOTION_STRENGTHES: [
    "약함",
    "보통",
    "강함"
  ],
  EMOTION_STRENGTH_DESC: (val: string) => `감정의 강도를 "${val}"${Josa.c(val, "으로/로")} 설정한다냥!`
} satisfies CommandOptions;
