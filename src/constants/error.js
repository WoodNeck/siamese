const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong, underline, block } = require('@/utils/markdown');


module.exports = {
	CMD_FAILED: '명령어 실행에 실패했어용!',
	CMD_INFORM_SIMILAR: (user, similar) => dedent`
		${user.toString()}님, 그런 명령어는 없어용. 혹시 ${underline(strong(similar))}${Josa.c(similar, '을/를')} 원하신건가용?`,
	CMD_PERMISSION_IS_MISSING: permissions => `명령어를 실행하기 위한 권한이 없어용! 아래 권한들이 저한테 있는지 확인해주세용!${block(permissions)}`,
	DICE: {
		ARG_INCORRECT: (min, max) => `${min}에서 ${max}사이의 숫자를 주세용!`,
	},
	CHOOSE: {
		ARG_NOT_SUFFICIENT: '고를 수 있는 항목을 충분히 주세용!',
	},
	SAY: {
		EMPTY_CONTENT: '따라할 문장을 주세용!',
	},
	SEARCH: {
		EMPTY_CONTENT: '검색할 내용을 주세용!',
		EMPTY_RESULT: target => `그 검색어로는 ${target}${Josa.c(target, '을/를')} 하나도 찾을수가 없었어용!`,
	},
	MUSIC: {
		RECONNECTING: '음성채널에 다시 참가하고 있어용...',
		JOIN_VOICE_CHANNEL_FAILED: '음성채널 참가에 실패했어용! 저한테 연결 권한이 있는지 확인해주세용!',
		JOIN_VOICE_CHANNEL_FIRST: '음성 채널에 들어가 있어야만 사용할 수 있는 명령어에용!',
		NO_VOICE_CHANNEL_IN: '제가 들어가있는 음성 채널이 없어용!',
		NO_PLAYERS_AVAILABLE: '이 서버에는 아직 재생중인 음악이 없어용!',
		NO_PERMISSION_GRANTED: '음성채널에 접속하기 위한 권한이 없어용!',
		VOICE_CHANNEL_IS_FULL: '음성채널에 제가 들어갈 자리가 없어용!',
		VOICE_CONNECTION_HAD_ERROR: '음성 채널 연결중에 오류가 발생했어용!',
		VOICE_CONNECTION_JOIN_FAILED: '음성 채널 연결에 실패했어용!',
		NOT_RESOLVABLE: dedent`
			제가 재생할 수 있는걸 주셔야 해용! 저는 이런걸 재생할 수 있어용!
			${block(`유튜브 동영상: https://www.youtube.com/watch?v=비디오_아이디
			유튜브 동영상(2): https://youtu.be/비디오_아이디
			유튜브 재생목록: https://www.youtube.com/playlist?list=재생목록_아이디
			유튜브 재생목록(2): https://www.youtube.com/watch?v=XXX&list=재생목록_아이디`)}
		`,
		SOMETHING_WRONG_HAPPEND: '재생중에 오류가 발생했어용!',
		FAILED_TO_PLAY: '재생에 실패했어용!',
		CANNOT_SKIP: '아직 스킵할 수 없어용!',
		STATE_MUST_BE_PLAYING: '재생중인 상태에서만 할 수 있어용!',
		STATE_MUST_BE_PAUSED: '일시정지 상태에서만 할 수 있어용!',
		QUEUE_EMPTY: '재생목록이 비어있어용!',
		PLAYLIST_INDEX_NO_INTEGER: '재생목록의 몇 번째 곡을 삭제할건지 숫자를 주세용!',
		PLAYLIST_INDEX_OUT_OF_RANGE: (min, max) => `${min}에서 ${max}사이의 숫자를 주세용!`,
	},
};
