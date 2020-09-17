const Channel = require('~/model/channel');
const DB = require('~/constants/db');


// Save the messages per channel, for later use for msg fetching
module.exports = async msg => {
	const channel = await Channel.findOneAndUpdate(
		{ id: msg.channel.id },
		{ '$inc': { msgCnt: 1 } },
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	).exec();

	// index starts with 1, as incr happens automatically every time
	if (channel.msgCnt % DB.MSG_SAVE_INTERVAL === 1) {
		channel.msgCnt = 1;
		channel.msgs.snowflakes.set(channel.msgs.index, msg.id);
		channel.msgs.index = channel.msgs.index + 1 < DB.MSG_SAVE_PER_CHANNEL
			? channel.msgs.index + 1
			: 0;
		channel.save();
	}
};
