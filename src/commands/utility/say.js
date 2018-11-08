const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { SAY } = require('@/constants/command');


module.exports = {
	name: SAY.CMD,
	description: SAY.DESC,
	usage: SAY.USAGE,
	hidden: false,
	devOnly: false,
	permission: [
		PERMISSION.VIEW_CHANNEL,
		PERMISSION.SEND_MESSAGES,
	],
	execute: ({ msg, channel, content }) => {
		// Can't react for empty content
		if (!content) {
			msg.error(ERROR.SAY.EMPTY_CONTENT);
			return;
		}
		msg.delete();
		channel.send(content);
	},
};
