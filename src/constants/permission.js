module.exports = {
	ADMINISTRATOR: {
		flag: 0x00000008,
		message: '관리자',
	},
	CREATE_INSTANT_INVITE: {
		flag: 0x00000001,
		message: '초대 코드 만들기',
	},
	KICK_MEMBERS: {
		flag: 0x00000002,
		message: '멤버 추방',
	},
	BAN_MEMBERS: {
		flag: 0x00000004,
		message: '멤버 차단',
	},
	MANAGE_CHANNELS: {
		flag: 0x00000010,
		message: '채널 관리',
	},
	MANAGE_GUILD: {
		flag: 0x00000020,
		message: '서버 관리',
	},
	ADD_REACTIONS: {
		flag: 0x00000040,
		message: '반응 추가',
	},
	VIEW_AUDIT_LOG: {
		flag: 0x00000080,
		message: '감사 로그 보기',
	},
	VIEW_CHANNEL: {
		flag: 0x00000400,
		message: '채팅 채널 읽기 및 음성 채널 보기',
	},
	SEND_MESSAGES: {
		flag: 0x00000800,
		message: '메시지 보내기',
	},
	SEND_TTS_MESSAGES: {
		flag: 0x00001000,
		message: 'TTS 메시지 보내기',
	},
	MANAGE_MESSAGES: {
		flag: 0x00002000,
		message: '메시지 관리',
	},
	EMBED_LINKS: {
		flag: 0x00004000,
		message: '링크 첨부',
	},
	ATTACH_FILES: {
		flag: 0x00008000,
		message: '파일 첨부',
	},
	READ_MESSAGE_HISTORY: {
		flag: 0x00010000,
		message: '메시지 기록 보기',
	},
	MENTION_EVERYONE: {
		flag: 0x00020000,
		message: '모두를 호출하기',
	},
	USE_EXTERNAL_EMOJIS: {
		flag: 0x00040000,
		message: '외부 스티커를 사용',
	},
	CONNECT: {
		flag: 0x00100000,
		message: '연결',
	},
	SPEAK: {
		flag: 0x00200000,
		message: '발언권',
	},
	MUTE_MEMBERS: {
		flag: 0x00400000,
		message: '멤버 마이크 끄기',
	},
	DEAFEN_MEMBERS: {
		flag: 0x00800000,
		message: '멤버 소리 끄기',
	},
	MOVE_MEMBERS: {
		flag: 0x01000000,
		message: '멤버 이동',
	},
	USE_VAD: {
		flag: 0x02000000,
		message: '음성 감지 사용',
	},
	PRIORITY_SPEAKER: {
		flag: 0x00000100,
		message: 'Priority Speaker',
	},
	CHANGE_NICKNAME: {
		flag: 0x04000000,
		message: '별명 변경',
	},
	MANAGE_NICKNAMES: {
		flag: 0x08000000,
		message: '별명 관리',
	},
	MANAGE_ROLES: {
		flag: 0x10000000,
		message: '역할 관리',
	},
	MANAGE_WEBHOOKS: {
		flag: 0x20000000,
		message: '웹훅 관리',
	},
	MANAGE_EMOJIS: {
		flag: 0x40000000,
		message: '이모지 관리',
	},
};
