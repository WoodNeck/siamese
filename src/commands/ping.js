const { CMD } = require('@/constants');


module.exports = {
	name: '핑',
	description: CMD.PONG_DESC,
	execute: msg => {
		msg.channel.send(CMD.PONG_MSG);
		// or msg.reply
	},
};
