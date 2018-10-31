const Dice = require('@/commands/utility/dice')(global.env.BOT_DEFAULT_LANG);
const { DICE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { makeBotMock, makeContextMock } = require('../../setups/mock');


describe('Command: Dice', () => {
	let context;
	beforeEach(async () => {
		context = await makeContextMock();
	});

	it('will send corect message for correct args', () => {
		const goodArgs = [DICE.MIN, DICE.MAX, Math.floor((DICE.MIN + DICE.MAX) / 2)];
		goodArgs.forEach(arg => {
			context.args = [arg];
			Dice.execute(context);
			expect(context.msg.reply).not.toBeCalledWith(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX));
		});
	});

	it('will send error msg for wrong type arg', () => {
		const wrongArgs = [jest.fn(), '', '타타루', true, null, undefined];
		wrongArgs.forEach(arg => {
			context.args = [arg];
			Dice.execute(context);
			expect(context.msg.reply).toBeCalledWith(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX));
		});
	});

	it('will send error msg for wrong ranged arg', () => {
		const wrongArgs = [DICE.MIN - 1, DICE.MAX + 1, 0, -1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
		wrongArgs.forEach(arg => {
			context.args = [arg];
			Dice.execute(context);
			expect(context.msg.reply).toBeCalledWith(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX));
		});
	});
})
