const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong, block } = require('@/utils/markdown');


module.exports = {
	CMD: {
		FAILED: '명령어 실행에 실패했다냥!',
		PERMISSION_IS_MISSING: permissions => `명령어를 실행할 수 있는 권한이 없다냥! 아래 권한들이 있는지 확인해달라냥!${block(permissions)}`,
		FAIL_TITLE: error => `${error.name}: ${error.message}`,
		FAIL_PLACE: msg => `${msg.guild}(${msg.guild.id}):${msg.channel}(${msg.channel.id})`,
		FAIL_CMD: msg => `While running command: ${strong(msg.content)}`,
		FAIL_DESC: error => `${error.stack ? error.stack : ''}`,
	},
	DICE: {
		ARG_INCORRECT: (min, max) => `${min}에서 ${max}사이의 숫자를 달라냥!`,
	},
	CHOOSE: {
		ARG_NOT_SUFFICIENT: '고를 수 있는 항목을 충분히 달라냥!',
	},
	SAY: {
		EMPTY_CONTENT: '따라할 문장을 달라냥!',
	},
	SEARCH: {
		EMPTY_CONTENT: '검색할 내용을 달라냥!',
		EMPTY_RESULT: target => `그 검색어로는 ${target}${Josa.c(target, '을/를')} 하나도 찾을수가 없었다냥!`,
	},
	MUSIC: {
		RECONNECTING: '음성채널에 다시 참가하고 있다냥...',
		JOIN_VOICE_CHANNEL_FAILED: '음성채널 참가에 실패했다냥! 연결 권한이 있는지 확인해달라냥!',
		JOIN_VOICE_CHANNEL_FIRST: '음성채널에 들어가 있어야만 사용할 수 있는 명령어다냥!',
		NO_VOICE_CHANNEL_IN: '들어가있는 음성 채널이 없다냥!',
		NO_PLAYERS_AVAILABLE: '이 서버에는 재생중인 음악이 없다냥!',
		NO_PERMISSION_GRANTED: '음성채널에 접속하기 위한 권한이 없다냥!',
		VOICE_CHANNEL_IS_FULL: '음성채널에 들어갈 자리가 없다냥!',
		VOICE_CONNECTION_HAD_ERROR: '음성채널 연결중에 오류가 발생했다냥!',
		VOICE_CONNECTION_JOIN_FAILED: '음성채널 연결에 실패했다냥!',
		NOT_RESOLVABLE: dedent`
			재생할 수 있는걸 달라냥! 이런걸 재생할 수 있다냥!
			${block(`유튜브 동영상: https://www.youtube.com/watch?v=비디오_아이디
			유튜브 동영상(2): https://youtu.be/비디오_아이디
			유튜브 재생목록: https://www.youtube.com/playlist?list=재생목록_아이디
			유튜브 재생목록(2): https://www.youtube.com/watch?v=XXX&list=재생목록_아이디`)}
		`,
		SOMETHING_WRONG_HAPPEND: '재생중에 오류가 발생했다냥!',
		FAILED_TO_PLAY: '재생에 실패했다냥!',
		CANNOT_SKIP: '아직 스킵할 수 없다냥!',
		STATE_MUST_BE_PLAYING: '재생중인 상태에서만 할 수 있다냥!',
		STATE_MUST_BE_PAUSED: '일시정지 상태에서만 할 수 있다냥!',
		QUEUE_EMPTY: '재생목록이 비어있다냥!',
		PLAYLIST_INDEX_NO_INTEGER: '재생목록의 몇 번째 곡을 삭제할건지 숫자를 달라냥!',
		PLAYLIST_INDEX_OUT_OF_RANGE: (min, max) => `${min}에서 ${max}사이의 숫자를 달라냥!`,
	},
};
