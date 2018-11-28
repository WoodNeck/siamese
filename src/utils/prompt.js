const EMOJI = require('@/constants/emoji');


module.exports = async (
	content,
	channel,
	author,
	maxWaitTime,
) => {
	return await channel.send(content)
		.then(async msg => {
			const yesEmoji = EMOJI.GREEN_CHECK;
			const noEmoji = EMOJI.CROSS;

			const emojis = [yesEmoji, noEmoji];

			for (const emoji of emojis) {
				await msg.react(emoji);
			}

			const reactionCollector = msg.createReactionCollector((reaction, user) => {
				return emojis.some(emoji => reaction.emoji.name === emoji)
					&& user.id === author.id;
			}, {
				time: maxWaitTime * 1000,
			});

			return new Promise(resolve => {
				reactionCollector.on('collect', () => {
					reactionCollector.stop();
				});

				reactionCollector.on('end', collected => {
					// Delete msg, it could been deleted already
					msg.delete().catch(() => {});

					const reaction = collected.first();
					// No reaction is resolved false
					resolve(reaction && reaction.emoji.name === yesEmoji);
				});
			});
		});
};
