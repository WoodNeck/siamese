const Josa = require('josa-js');
const dedent = require('@/utils/dedent');
const EMOJI = require('@/constants/emoji');


module.exports = {
	PING: {
		CMD: '핑',
		DESC: '퐁을 대답한다냥!',
		MSG: (ping, bot, guild, uptime) => dedent`
			퐁이다냥! 현재 샴고양이 웹소켓 핑 평균은 ${ping}다냥!
			${bot.user.toString()}${Josa.c(bot.getNameIn(guild), '은/는')} ${uptime.hours}시간 ${uptime.minutes}분 ${uptime.seconds}초동안 일하고 있다냥!`,
	},
	INVITE: {
		CMD: '초대',
		DESC: '봇을 초대할 수 있는 링크를 준다냥!',
		MSG: (botMention, link) => `${botMention}의 초대 링크다냥!\n${link}`,
	},
	HELP: {
		CMD: '도움',
		DESC: '명령어 목록을 보여준다냥!',
		RECITAL_TIME: 30,
	},
	DEV_SERVER: {
		CMD: '개발서버',
		DESC: '개발 서버로 올 수 있는 초대 링크를 준다냥!',
		INVITE_LINK: (bot, invite) => dedent`
			${bot.user.toString()}의 개발 서버 초대 링크다냥!
			와서 사용/개발에 관한 질문, 기능요청, 버그제보 등을 할 수 있다냥!
			${invite}`,
	},
	INFO: {
		CMD: '정보',
		DESC: '봇과 관련된 정보를 볼 수 있다냥!',
		GUILD_CNT: guildCnt => `${EMOJI.UP_TRIANGLE} 서버 수 - ${guildCnt}개`,
		USER_CNT: userCnt => `${EMOJI.PEOPLE} 사용자 수 - ${userCnt}명`,
		PLAYER_CNT: playerCnt => `${EMOJI.MICROPHONE} 재생중인 음악 수 - ${playerCnt}개`,
		GITHUB_ICON_URL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
		DEV_SERVER: '개발 서버',
	},
	GUILDLIST: {
		CMD: '서버목록',
		GUILD_ENTRY: guild => dedent`
			${guild.systemChannel ? EMOJI.GREEN_CHECK : EMOJI.CROSS} - ${guild.name}(${guild.members.filter(member => !member.user.bot).size}명)`,
	},
	STATS: {
		CMD: '통계',
		DESC: '봇 명령어 사용 통계를 확인할 수 있다냥!',
		USAGE: '[명령어 이름]',
		TITLE: botOrCmd => `${botOrCmd}의 사용 통계다냥!`,
		CMD_INFO: cmd => dedent`
			${EMOJI.BAR_CHART} 사용 횟수: ${cmd.callCount}회
			${EMOJI.ALARM} 평균 수행 시간: ${cmd.avgTime > 1000 ? `${(cmd.avgTime / 1000).toFixed(2)}s` : `${cmd.avgTime.toFixed(2)}ms`}`,
		CMD_INFO_ONE_LINE: cmd => `${EMOJI.SMALL_WHITE_SQUARE}${cmd.name} - ${EMOJI.BAR_CHART} ${cmd.callCount}회 ${EMOJI.ALARM} ${cmd.avgTime > 1000 ? `${(cmd.avgTime / 1000).toFixed(2)}s` : `${cmd.avgTime.toFixed(2)}ms`}`,
		CMD_PER_PAGE: 5,
		RECITAL_TIME: 30,
	},
	GUILDSTATS: {
		CMD: '서버통계',
		DESC: '이 서버에서의 봇 명령어 사용 통계를 확인할 수 있다냥!',
		USAGE: '[명령어 이름]',
		TITLE: (botOrCmd, guildName) => `${botOrCmd}의 ${guildName}에서의 사용 통계다냥!`,
		CMD_INFO: cmd => dedent`
			${EMOJI.BAR_CHART} 사용 횟수: ${cmd.callCount}회`,
		CMD_INFO_ONE_LINE: cmd => `${EMOJI.SMALL_WHITE_SQUARE}${cmd.name} - ${EMOJI.BAR_CHART} ${cmd.callCount}회`,
	},
};
