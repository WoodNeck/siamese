const dedent = require('@/utils/dedent');
const Josa = require('josa-js');
const { strong, code } = require('@/utils/markdown');


module.exports = {
	PING: {
		CMD: '핑',
		DESC: '퐁을 대답해용!',
		MSG: (ping, bot, guild, uptime) => dedent`
			퐁이에용! 현재 API 서버와의 핑은 ${ping}에용!
			${bot.user.toString()}${Josa.c(bot.getNameIn(guild), '은/는')} ${uptime.hours}시간 ${uptime.minutes}분 ${uptime.seconds}초동안 일하고 있어용!`,
	},
	INVITE: {
		CMD: '초대',
		DESC: '봇을 초대할 수 있는 링크를 드려용!',
		MSG: (botMention, link) => `${botMention}의 초대 링크에용!\n${link}`,
	},
	HELP: {
		CMD: '도움',
		DESC: '명령어 목록을 표시해용!',
		RECITAL_TIME: 30,
	},
	DICE: {
		CMD: '주사위',
		DESC: 'n면짜리 주사위를 굴려용! (기본값: 100)',
		USAGE: '[n]',
		MIN: 2,
		MAX: 10000,
		DEFAULT: 100,
		MSG: (user, num, maxNum) => {
			// Korean josa for number 0-9
			const josa = ['이', '이', '가', '이', '가', '가', '이', '이', '이', '가'];
			const numStr = num.toString();
			return `${user.toString()}님이 주사위를 굴려 🎲${strong(numStr)}${josa[num % 10]} 나왔어용! (1-${maxNum})`;
		},
	},
	CHOOSE: {
		CMD: '골라줘',
		DESC: '주신 항목들 중 하나를 임의로 골라드려용!',
		USAGE: '항목1 항목2 [항목3...]',
	},
	SAY: {
		CMD: '따라해',
		DESC: '하신 말을 지운 후에 따라해용!',
		USAGE: '따라할 문장',
	},
	IMAGE: {
		CMD: '이미지',
		DESC: '구글 이미지를 검색해용!',
		USAGE: '검색어',
		TARGET: '이미지',
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://www.google.co.kr/search',
		SEARCH_PARAMS: query => {
			return {
				q: query,
				tbm: 'isch',
			};
		},
	},
	YOUTUBE: {
		CMD: '유튜브',
		DESC: '유튜브 동영상을 검색해용!',
		USAGE: '검색어',
		TARGET: '동영상',
		TIME_NOT_DEFINED: '??:??',
		RECITAL_TIME: 30,
		MAX_RESULTS: 10,
		VIDEO_URL: videoId => `https://youtu.be/${videoId}`,
		VIDEO_URL_WITH_TIME: (videoId, videoLength) => `https://youtu.be/${videoId} ${code(videoLength)}`,
	},
	KIN: {
		CMD: '지식인',
		DESC: '네이버 지식인을 검색해용!',
		USAGE: '검색어',
		TARGET: '지식인 항목',
		ITEMS_PER_PAGE: 5,
		RECITAL_TIME: 30,
		SEARCH_URL: 'https://openapi.naver.com/v1/search/kin.json',
		SEARCH_PARAMS: query => {
			return {
				query: query,
				display: 50,
				sort: 'sim',
			};
		},
	},
	IN: {
		CMD: '들어와',
		DESC: '음성 채널에 참가해용!',
	},
	OUT: {
		CMD: '나가',
		DESC: '참가한 음성채널에서 나가용!',
	},
	LOOP: {
		CMD: '루프',
		DESC: '음악 재생 반복 여부를 설정해용!',
	},
	PLAY: {
		CMD: '재생해줘',
		DESC: '새로운 음악을 재생목록에 추가해용!',
		USAGE: '유튜브주소',
	},
	RESUME: {
		CMD: '재생',
		DESC: '일시정지/정지했던 음악을 재개해용!',
	},
	PAUSE: {
		CMD: '일시정지',
		DESC: '재생중인 음악을 일시정지해용!',
	},
	SKIP: {
		CMD: '스킵',
		DESC: '재생중인 음악을 스킵하고 다음곡으로 넘어가용!',
	},
	CURRENT: {
		CMD: '현재곡',
		DESC: '현재 재생중인 음악의 정보를 보여드려용!',
	},
	PLAYLIST: {
		CMD: '재생목록',
		DESC: '현재 서버의 음악 재생목록을 보여드려용!',
	},
	CANCEL: {
		CMD: '취소',
		DESC: '재생목록에서 곡을 삭제해용!',
	},
};
