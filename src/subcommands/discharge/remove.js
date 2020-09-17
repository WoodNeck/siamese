const Discharge = require('~/model/discharge');
const ERROR = require('~/constants/error');
const { DISCHARGE_REMOVE } = require('~/constants/commands/history');


module.exports = {
	name: DISCHARGE_REMOVE.CMD,
	description: DISCHARGE_REMOVE.DESC,
	usage: DISCHARGE_REMOVE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: async ({ channel, guild, msg, content }) => {
		// No multiline is allowed
		const name = content.split('\n')[0];

		if (!name) {
			msg.error(ERROR.DISCHARGE.PROVIDE_NAME_TO_REMOVE);
			return;
		}

		channel.startTyping();

		const info = await Discharge.findOne({
			name: name,
			guildId: guild.id,
		}).exec();

		if (!info) {
			msg.error(ERROR.DISCHARGE.NOT_FOUND);
			return;
		}

		info.remove();

		channel.send(DISCHARGE_REMOVE.SUCCESS(name));
	},
};
