const { Collection, MessageEmbed } = require('discord.js');
const Conversation = require('~/utils/conversation');
const COLOR = require('~/constants/color');
const EMOJI = require('~/constants/emoji');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { VOTE } = require('~/constants/commands/utility');
const { COOLDOWN, DIALOGUE } = require('~/constants/type');


module.exports = {
	name: VOTE.CMD,
	description: VOTE.DESC,
	usage: VOTE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
		PERMISSION.ADD_REACTIONS,
		PERMISSION.MANAGE_MESSAGES,
	],
	cooldown: COOLDOWN.PER_CHANNEL(5),
	execute: async ({ author, channel, msg, content }) => {
		if (!content) {
			msg.error(ERROR.CMD.EMPTY_CONTENT(VOTE.TARGET));
			return;
		}

		channel.startTyping();

		// Start gathering detailed info
		const conversation = new Conversation(msg);
		const optionsDialogue = new MessageEmbed()
			.setTitle(VOTE.OPTIONS_TITLE)
			.setDescription(VOTE.OPTIONS_DESC)
			.setColor(COLOR.BOT)
			.setFooter(VOTE.OPTIONS_FOOTER);
		conversation.add(
			optionsDialogue,
			// Should contain more than 1 comma, and should not empty
			message => message.content.split(',')
				.map(option => option.trim())
				.filter(option => option).length.between(2, 9),
			ERROR.VOTE.OPTIONS_BETWEEN_2_9
		);

		const durationDialogue = new MessageEmbed()
			.setTitle(VOTE.DURATION_TITLE)
			.setDescription(VOTE.DURATION_DESC)
			.setColor(COLOR.BOT)
			.setFooter(VOTE.DURATION_FOOTER);
		conversation.add(
			durationDialogue,
			// Should in between 1 and DURATION_MAX
			message => /^([1-9]\d*|0)$/.test(message.content)
				&& parseInt(message.content, 10) < VOTE.DURATION_MAX,
			ERROR.VOTE.DURATION_SHOULD_CLAMPED(VOTE.DURATION_MAX)
		);

		const result = await conversation.start(VOTE.CONVERSATION_TIME);
		if (result.endReason !== DIALOGUE.VALID) return;

		const options = result.responses[0]
			.split(',')
			.map(option => option.trim())
			.filter(option => option);

		const durationMinute = parseInt(result.responses[1], 10);

		const voteEmbed = new MessageEmbed()
			.setTitle(VOTE.TITLE(content))
			.setDescription(
				options
					.map((option, idx) => `${idx + 1}${EMOJI.KEYCAP} ${option}`)
					.join('\n')
			)
			.setFooter(VOTE.AUTHOR(author.displayName), author.user.avatarURL())
			.setColor(COLOR.BOT);

		const numberEmojis = options.map((option, idx) => `${idx + 1}${EMOJI.KEYCAP}`);
		const voteMsg = await channel.send(VOTE.HELP_DESC, { embed: voteEmbed });
		for (let idx = 0; idx < options.length; idx += 1) {
			await voteMsg.react(numberEmojis[idx]);
		}

		const voteCollection = new Collection();

		// As collect event can't get user who gave reaction
		// Hack filter to retrieve user info
		const reactionFilter = (reaction, user) => {
			const isCorrectReaction = numberEmojis.some(emoji => emoji === reaction.emoji.name);
			if (!user.bot && isCorrectReaction) {
				const idx = numberEmojis.indexOf(reaction.emoji.name);
				voteCollection.set(user.id, idx);
				// Remove user reaction immediately, to hide who voted on what
				reaction.users.remove(user).catch(() => {});
			}
		};
		const reactionCollector = voteMsg.createReactionCollector(reactionFilter, {
			time: durationMinute * 60 * 1000,
		});

		reactionCollector.on('end', async () => {
			// Remove vote msg, could been deleted already
			await voteMsg.delete().catch(() => {});

			const voteCounts = options.reduce((counts, option, idx) => {
				counts[idx] = 0;
				return counts;
			}, {});
			voteCollection.forEach(val => voteCounts[val] += 1);

			let bestIdx = 0;
			options.forEach((option, idx) => {
				if (voteCounts[idx] > voteCounts[bestIdx]) {
					bestIdx = idx;
				}
			});

			const voteResultEmbed = new MessageEmbed()
				.setTitle(VOTE.TITLE(content))
				.setDescription(
					options
						.map((option, idx) => `${idx + 1}${EMOJI.KEYCAP} ${option}: ${VOTE.COUNT(voteCounts[idx])}`)
						.join('\n')
				)
				.setColor(COLOR.BOT)
				.setFooter(VOTE.AUTHOR(author.displayName), author.user.avatarURL());

			channel.send(
				VOTE.RESULT_DESC(options[bestIdx], voteCounts[bestIdx]),
				{ embed: voteResultEmbed }
			);
		});
	},
};
