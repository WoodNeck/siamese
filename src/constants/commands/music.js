module.exports = {
	IN: {
		CMD: '들어와',
		DESC: '음성 채널에 참가한다냥!',
	},
	OUT: {
		CMD: '나가',
		DESC: '재생하던 곡을 정지하고 참가한 음성채널에서 나간다냥!',
	},
	LOOP: {
		CMD: '루프',
		DESC: '음악 재생 반복 여부를 설정한다냥!',
	},
	PLAY: {
		CMD: '재생해줘',
		DESC: '새로운 음악을 재생목록에 추가한다냥!',
		USAGE: '유튜브주소',
		PLAYLIST: '재생목록',
		MAX_TIMEOUT: 15000,
	},
	RESUME: {
		CMD: '재생',
		DESC: '일시정지했던 음악을 재개한다냥!',
	},
	PAUSE: {
		CMD: '일시정지',
		DESC: '재생중인 음악을 일시정지한다냥!',
	},
	SKIP: {
		CMD: '스킵',
		DESC: '재생중인 음악을 스킵하고 다음곡으로 넘어간다냥!',
	},
	CURRENT: {
		CMD: '현재곡',
		DESC: '현재 재생중인 음악의 정보를 보여준다냥!',
	},
	PLAYLIST: {
		CMD: '재생목록',
		DESC: '현재 서버의 음악 재생목록을 보여준다냥!',
	},
	CANCEL: {
		CMD: '취소',
		DESC: '재생목록에서 곡을 삭제한다냥!',
	},
	TTS: {
		CMD: 'tts',
		DESC: 'Text-to-speech 메시지를 음성 채널에서 재생한다냥!',
		USAGE: '문장',
		TARGET: '읽을 문장',
		MAX_LENGTH: 500,
	},
};
