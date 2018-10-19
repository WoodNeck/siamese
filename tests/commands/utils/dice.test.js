const Tataru = require('@/tataru');
const Dice = require('@/commands/utils/dice')(global.env.BOT_DEFAULT_LANG);
const { DICE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Dice', () => {
	let tataru;
	let testObj;
	beforeEach(() => {
		tataru = new Tataru();
		tataru._loadCommands();
		testObj = {
			bot: tataru,
			author: {
				toString: () => '타타루',
			},
			channel: {
				send: jest.fn(),
			},
			args: [],
		}
	});

	it('will anyway send message', () => {
		Dice.execute(testObj);
		expect(testObj.channel.send).toBeCalled();
	});

	it('will send corect message for correct args', () => {
		const goodArgs = [DICE.MIN, DICE.MAX, Math.floor((DICE.MIN + DICE.MAX) / 2)];
		goodArgs.forEach(arg => {
			testObj.args = [arg];
			Dice.execute(testObj);
			expect(testObj.channel.send).not.toBeCalledWith(DICE.ERROR_ARG_INCORRECT(testObj.author, DICE.MIN, DICE.MAX));
		});
	});

	it('will send error msg for wrong type arg', () => {
		const wrongArgs = [jest.fn(), '', '타타루', true, null, undefined];
		wrongArgs.forEach(arg => {
			testObj.args = [arg];
			Dice.execute(testObj);
			expect(testObj.channel.send).toBeCalledWith(DICE.ERROR_ARG_INCORRECT(testObj.author, DICE.MIN, DICE.MAX));
		});
	});

	it('will send error msg for wrong ranged arg', () => {
		const wrongArgs = [DICE.MIN - 1, DICE.MAX + 1, 0, -1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
		wrongArgs.forEach(arg => {
			testObj.args = [arg];
			Dice.execute(testObj);
			expect(testObj.channel.send).toBeCalledWith(DICE.ERROR_ARG_INCORRECT(testObj.author, DICE.MIN, DICE.MAX));
		});
	});
})
