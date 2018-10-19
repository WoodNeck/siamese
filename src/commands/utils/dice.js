module.exports = lang => {
	const { DICE } = require('@/constants')(lang);

	return {
		name: DICE.CMD,
		description: DICE.DESC,
		usage: DICE.USAGE,
		hidden: false,
		devOnly: false,
		execute: ({ author, channel, args }) => {
			const isNum = /^\d+$/;
			if (args.length && !isNum.test(args[0])) {
				channel.send(DICE.ERROR_ARG_INCORRECT(author, DICE.MIN, DICE.MAX));
				return;
			}
			const diceNum = args.length && isNum.test(args[0]) ?
				parseInt(args[0]) : DICE.DEFAULT;
			if (diceNum > DICE.MAX || diceNum < DICE.MIN) {
				channel.send(DICE.ERROR_ARG_INCORRECT(author, DICE.MIN, DICE.MAX));
				return;
			}
			const diceResult = Math.floor(Math.random() * (diceNum)) + 1;
			channel.send(DICE.MSG(author, diceResult, diceNum));
		},
	};
};
