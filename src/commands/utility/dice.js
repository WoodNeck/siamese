const error = require('@/utils/error');


module.exports = lang => {
	const { DICE } = require('@/constants')(lang);

	return {
		name: DICE.CMD,
		description: DICE.DESC,
		usage: DICE.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ author, channel, args, locale }) => {
			const isNum = /^\d+$/;
			// Non-number case
			if (args.length && !isNum.test(args[0])) {
				channel.send(error(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX), locale).by(author));
				return;
			}

			const diceNum = args.length && isNum.test(args[0]) ?
				parseInt(args[0]) : DICE.DEFAULT;

			// Out-of-range case
			if (diceNum > DICE.MAX || diceNum < DICE.MIN) {
				channel.send(error(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX), locale).by(author));
				return;
			}

			const diceResult = Math.floor(Math.random() * (diceNum)) + 1;
			channel.send(DICE.MSG(author, diceResult, diceNum));
		},
	};
};
