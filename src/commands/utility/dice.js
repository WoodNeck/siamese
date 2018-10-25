module.exports = lang => {
	const { DICE } = require('@/constants')(lang);

	return {
		name: DICE.CMD,
		description: DICE.DESC,
		usage: DICE.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ msg, author, channel, args }) => {
			const isNum = /^\d+$/;
			// Non-number case
			if (args.length && !isNum.test(args[0])) {
				msg.reply(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX));
				return;
			}

			const diceNum = args.length && isNum.test(args[0]) ?
				parseInt(args[0], 10) : DICE.DEFAULT;

			// Out-of-range case
			if (diceNum > DICE.MAX || diceNum < DICE.MIN) {
				msg.reply(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX));
				return;
			}

			const diceResult = Math.floor(Math.random() * (diceNum)) + 1;
			channel.send(DICE.MSG(author, diceResult, diceNum));
		},
	};
};
