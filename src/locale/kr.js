const dedent = require('@/utils/dedent');
const { strong, underline } = require('@/utils/markdown');


module.exports = {
	BOT: {
		READY_TITLE: bot => dedent`
			${bot.user.tag} 일할 준비 됐어용!`,
		READY_DESC: bot => dedent`
			- ${bot.guilds.size}개의 서버에서
			- ${bot.users.filter(user => !user.bot).size}명이 사용 중이에용!`,
		GUILD_JOIN_TITLE: bot => dedent`
			안뇽하세용 ${bot.user.username}에용!`,
		GUILD_JOIN_DESC: (bot, helpCmd) => dedent`
			${underline(strong(helpCmd))}이라고 말해주시면 ${bot.user.username}가 할 수 있는 일을 알 수 있어용!`,
		GUILD_JOIN_FOOTER: bot => dedent`
			여기는 ${bot.user.username}가 일하는 ${bot.guilds.size}번째 서버에용!`,
		CMD_FAILED: '명령어 실행에 실패했어용!',
	},
	ERROR: {
		CMD_FAIL_TITLE: error => `${error.name}: ${error.message}`,
		CMD_FAIL_DESC: (msg, error) => dedent`
			${msg.guild}(${msg.guild.id}):${msg.channel}(${msg.channel.id})
			${error.stack}`,
		LOG_MODE_NOT_DEFINED: mode => dedent`
			로그 모드 ${mode}는 상수로 정의되지 않았어용!`,
		ABSTRACT_CLASS_INSTANTIZED: cls => dedent`
			추상 클래스 ${cls}의 인스턴스가 생성되었어용!`,
	},
	// Command Categories
	UTILS: {
		NAME: '유틸리티',
	},
	// Commands
	PING: {
		CMD: '핑',
		DESC: '퐁을 대답해용!',
		MSG: (ping, botMention, uptime) => dedent`
			퐁이에용! 현재 API 서버와의 핑은 ${ping}에용!
			${botMention}는 ${uptime.hours}시간 ${uptime.minutes}분 ${uptime.seconds}초동안 일하고 있어용!`,
	},
	INVITE: {
		CMD: '초대',
		DESC: '봇을 초대할 수 있는 링크를 드려용!',
		MSG: (botMention, link) => `${botMention}의 초대 링크에용!\n${link}`,
	},
	HELP: {
		CMD: '도움',
		DESC: '명령어 목록을 표시해용!',
	},
};
