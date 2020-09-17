const { MessageEmbed } = require('discord.js');
const Conversation = require('~/utils/conversation');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { BMI } = require('~/constants/commands/useful');
const { DIALOGUE } = require('~/constants/type');


module.exports = {
	name: BMI.CMD,
	description: BMI.DESC,
	usage: BMI.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	execute: async ({ msg, channel, args }) => {
		channel.startTyping();
		let height;
		let weight;

		if (args.length >= 2) {
			height = parseFloat(args[0]);
			weight = parseFloat(args[1]);
		}
		else {
			const conversation = new Conversation(msg);

			const heightDialogue = new MessageEmbed()
				.setTitle(BMI.DIALOGUE_HEIGHT.TITLE)
				.setDescription(BMI.DIALOGUE_HEIGHT.DESC)
				.setColor(COLOR.BOT)
				.setFooter(BMI.DIALOGUE_HEIGHT.FOOTER);
			const weightDialogue = new MessageEmbed()
				.setTitle(BMI.DIALOGUE_WEIGHT.TITLE)
				.setDescription(BMI.DIALOGUE_WEIGHT.DESC)
				.setColor(COLOR.BOT)
				.setFooter(BMI.DIALOGUE_WEIGHT.FOOTER);

			conversation.add(heightDialogue);
			conversation.add(weightDialogue);


			const result = await conversation.start(BMI.CONVERSATION_TIME);
			if (result.endReason !== DIALOGUE.VALID) return;

			[height, weight] = result.responses.map(val => parseFloat(val));
		}

		if (!height || !weight
			|| !height.between(BMI.HEIGHT_MIN, BMI.HEIGHT_MAX)
			|| !weight.between(BMI.WEIGHT_MIN, BMI.WEIGHT_MAX)) {
			msg.error(ERROR.BMI.ARGS_NOT_FORMATTED(
				BMI.HEIGHT_MIN, BMI.HEIGHT_MAX,
				BMI.WEIGHT_MIN, BMI.WEIGHT_MAX,
			));
			return;
		}

		// BMI height is measured in 'm' unit, not 'cm' that we have
		const bmi = weight * 10000 / (height * height);
		let className;
		for (const bmiClass of Object.keys(BMI.CLASS)) {
			if (bmi < BMI.CLASS[bmiClass].max) {
				className = BMI.CLASS[bmiClass].name;
				break;
			}
		}

		const embed = new MessageEmbed()
			.setTitle(BMI.RESULT.TITLE)
			.setDescription(BMI.RESULT.DESC(height, weight, bmi, className))
			.setColor(COLOR.BOT);
		channel.send(embed);
	},
};
