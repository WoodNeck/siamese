const { RichEmbed } = require('discord.js');
const Discharge = require('@/model/discharge');
const Conversation = require('@/utils/conversation');
const prompt = require('@/utils/prompt');
const COLOR = require('@/constants/color');
const ERROR = require('@/constants/error');
const { DISCHARGE_ADD } = require('@/constants/commands/history');
const { DIALOGUE } = require('@/constants/type');


module.exports = {
	name: DISCHARGE_ADD.CMD,
	description: DISCHARGE_ADD.DESC,
	usage: DISCHARGE_ADD.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [],
	execute: async ({ author, channel, msg, content }) => {
		// No multiline is allowed
		const name = content.split('\n')[0];

		if (!name) {
			msg.error(ERROR.DISCHARGE.PROVIDE_NAME_TO_ADD);
			return;
		}
		if (name.length > DISCHARGE_ADD.NAME_MAX_LENGTH) {
			msg.error(ERROR.DISCHARGE.NAME_TOO_LONG(DISCHARGE_ADD.NAME_MAX_LENGTH));
			return;
		}

		const prevInfo = await Discharge.findOne({
			name: name,
			channelId: channel.id,
		}).exec();

		if (prevInfo) {
			const prevInfoDescription = new RichEmbed()
				.setTitle(DISCHARGE_ADD.NAME_ALREADY_EXISTS(name))
				.setDescription(DISCHARGE_ADD.SHORT_INFO(prevInfo))
				.setColor(COLOR.BOT);
			// Previous info exists with same name
			const willUpdate = await prompt(prevInfoDescription, channel, author, DISCHARGE_ADD.PROMPT_TIME);
			if (!willUpdate) return;
		}

		// Make new one, or update if user agreed
		const conversation = new Conversation(msg);

		const joinDateDialogue = new RichEmbed()
			.setTitle(DISCHARGE_ADD.DIALOGUE_JOIN_DATE_TITLE(name))
			.setDescription(DISCHARGE_ADD.DIALOGUE_JOIN_DATE_DESC)
			.setColor(COLOR.BOT)
			.setFooter(DISCHARGE_ADD.DIALOGUE_JOIN_DATE_EXAMPLE);
		conversation.add(
			joinDateDialogue,
			message => {
				const date = new Date(message.content);
				return date instanceof Date
					&& !isNaN(date);
			}
		);

		const forcesDialogue = new RichEmbed()
			.setTitle(DISCHARGE_ADD.DIALOGUE_FORCES_TITLE)
			.setDescription(DISCHARGE_ADD.DIALOGUE_FORCES_EXAMPLE())
			.setColor(COLOR.BOT);
		conversation.add(
			forcesDialogue,
			message => Object.keys(DISCHARGE_ADD.FORCES_LENGTH)
				.some(force => force === message.content),
		);

		const result = await conversation.start(DISCHARGE_ADD.CONVERSATION_TIME);
		// user not responded
		if (result.endReason === DIALOGUE.NO_RESPONSE) {
			msg.error(ERROR.CONVERSATION.NO_RESPONSE(DISCHARGE_ADD.CONVERSATION_TIME));
			return;
		}
		else if (result.endReason === DIALOGUE.INVALID) {
			// Failed to retrieve join date
			if (result.responses.length === 0) {
				msg.error(ERROR.DISCHARGE.JOIN_DATE_NOT_FORMATTED);
			}
			// Failed to retrieve forces info
			else if (result.responses.length === 1) {
				msg.error(ERROR.DISCHARGE.FORCES_NOT_LISTED);
			}
			return;
		}

		const joinDate = new Date(result.responses[0]);
		const forceName = result.responses[1];

		// Add new discharge info
		await Discharge.updateOne(
			{ name: name, channelId: channel.id },
			{ joinDate: joinDate, force: forceName },
			{ upsert: true }
		).exec();

		channel.send(DISCHARGE_ADD.SUCCESS(name));
	},
};
