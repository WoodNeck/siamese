const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong, block } = require('@/utils/markdown');


module.exports = {
	BOT: {
		FAILED_TO_START: '❗ 봇 시작을 실패했다냥 ❗',
	},
	ENV: {
		VAR_MISSING: key => `${key}가 bot.env파일에 없다냥!`,
		VAR_NO_EMPTY_STRING: '이 변수는 비어있지 않은 문자열을 줘야된다냥!',
	},
	DB: {
		FAILED_TO_CONNECT: '데이터베이스 연결에 실패했다냥!',
		GOT_AN_ERROR: '데이터베이스 사용중에 오류가 발생했다냥!',
	},
	CMD: {
		CATEGORY_LOAD_FAILED: category => `"${category}" 명령어 카테고리를 로드하는데 실패했다냥! ("index.js"가 폴더 안에 있는지 확인하라냥!)`,
		LOAD_FAILED: cmd => `"${cmd}" 명령어를 로드하는데 실패했다냥!`,
		SUB_LOAD_FAILED: (cmd, sub) => `"${cmd}/${sub}" 서브 명령어를 로드하는데 실패했다냥!`,
		FAILED: '명령어 실행에 실패했다냥!',
		PERMISSION_IS_MISSING: permissions => `명령어를 실행할 수 있는 권한이 없다냥! 아래 권한들이 있는지 확인해달라냥!${block(permissions)}`,
		FAIL_TITLE: error => `${error.name}: ${error.message}`,
		FAIL_PLACE: msg => `${msg.guild}(${msg.guild.id}):${msg.channel}(${msg.channel.id})`,
		FAIL_CMD: msg => `이 명령어를 실행중이었다냥: ${strong(msg.content)}`,
		FAIL_DESC: error => `${error.stack ? error.stack : ''}`,
		ON_COOLDOWN: seconds => `명령어가 쿨다운중이다냥! ${seconds}초 더 기다리라냥!`,
	},
	API: {
		KEY_MISSING: 'API 키가 정의되지 않았다냥!',
		TEST_EMPTY_RESULT: 'API test case returned empty result',
	},
	LOGGER: {
		TYPE_NOT_DEFINED: mode => `"${mode}" -> 등록되지 않은 로그 타입이다냥!`,
	},
	BOOK: {
		CAN_ADD_ONLY_PAGE: '책에는 페이지만 추가할 수 있다냥!',
		ENTRY_IS_EMPTY: '비어있는 책을 낭독하려고 한다냥!',
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
		TYPE_NOT_DEFINED: type => `"${type}" -> 등록되지 않은 음악 타입이다냥!`,
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
			유튜브 재생목록(2): https://www.youtube.com/watch?v=XXX&list=재생목록_아이디`)}`,
		SOMETHING_WRONG_HAPPEND: '재생중에 오류가 발생했다냥!',
		FAILED_TO_PLAY: '재생에 실패했다냥!',
		CANNOT_SKIP: '아직 스킵할 수 없다냥!',
		STATE_MUST_BE_PLAYING: '재생중인 상태에서만 할 수 있다냥!',
		STATE_MUST_BE_PAUSED: '일시정지 상태에서만 할 수 있다냥!',
		QUEUE_EMPTY: '재생목록이 비어있다냥!',
		PLAYLIST_INDEX_NO_INTEGER: '재생목록의 몇 번째 곡을 삭제할건지 숫자를 달라냥!',
		PLAYLIST_INDEX_OUT_OF_RANGE: (min, max) => `${min}에서 ${max}사이의 숫자를 달라냥!`,
	},
	RANDOM: {
		NO_ENTRY_FOUND: '이 채널은 아직 메시지가 충분히 기록되지 않았다냥!',
		CANT_FIND_MSG: '메시지를 하나도 가져오지 못했다냥! 다시 시도해달라냥!',
	},
	STEAM: {
		USER_NOT_FOUND: '그 아이디로는 유저를 찾지 못했다냥!',
		EMPTY_GAMES: '계정이 비공개거나 가진 게임이 하나도 없다냥!',
	},
	NSFW: {
		NOT_NSFW_CHANNEL: '후방주의 채널이 아니다냥! 채널 설정을 확인해보라냥!',
		HITOMI_PROVIDE_INTEGER_ONLY: '히토미 번호는 숫자로 된것만 달라냥!',
		HITOMI_NUM_NOT_VALID: '페이지를 찾지 못했다냥!',
	},
};
