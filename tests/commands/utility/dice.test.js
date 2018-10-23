const Tataru = require('@/tataru');
const error = require('@/utils/error');
const Dice = require('@/commands/utility/dice')(global.env.BOT_DEFAULT_LANG);
const { DICE } = require('@/constants')(global.env.BOT_DEFAULT_LANG);


describe('Command: Dice', () => {
	beforeEach(() => {
		global.botMock._loadCommands();
	});

	it('will anyway send message', () => {
		Dice.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.sendMock).toBeCalled();
	});

	it('will send corect message for correct args', () => {
		const goodArgs = [DICE.MIN, DICE.MAX, Math.floor((DICE.MIN + DICE.MAX) / 2)];
		goodArgs.forEach(arg => {
			global.cmdObjMock.args = [arg];
			Dice.execute(global.cmdObjMock);
			expect(global.cmdObjMock.channel.sendMock).not.toBeCalledWith(
				error(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX), global.cmdObjMock.locale).by(global.cmdObjMock.author)
			);
		});
	});

	it('will send error msg for wrong type arg', () => {
		const wrongArgs = [jest.fn(), '', '타타루', true, null, undefined];
		wrongArgs.forEach(arg => {
			global.cmdObjMock.args = [arg];
			Dice.execute(global.cmdObjMock);
			expect(global.cmdObjMock.channel.sendMock).toBeCalledWith(
				error(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX), global.cmdObjMock.locale).by(global.cmdObjMock.author)
			);
		});
	});

	it('will send error msg for wrong ranged arg', () => {
		const wrongArgs = [DICE.MIN - 1, DICE.MAX + 1, 0, -1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
		wrongArgs.forEach(arg => {
			global.cmdObjMock.args = [arg];
			Dice.execute(global.cmdObjMock);
			expect(global.cmdObjMock.channel.sendMock).toBeCalledWith(
				error(DICE.ERROR_ARG_INCORRECT(DICE.MIN, DICE.MAX), global.cmdObjMock.locale).by(global.cmdObjMock.author)
			);
		});
	});
})
