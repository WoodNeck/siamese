const { Collection } = require('discord.js');
const handler = require('@/tataru.on');
const { PING, BOT, INVITE, HELP } = require('@/constants')(global.env.BOT_DEFAULT_LANG);

describe('Message handling', () => {
	it('will set logger when ready', () => {
		handler.ready.call(global.botMock);
		expect(global.botMock.log).not.toBeUndefined();
	});

	it('will log ready msg when ready', () => {
		handler.ready.call(global.botMock);
		expect(global.logSpy).toBeCalled();
	});

	it('will call proper command', () => {
		const messageHandler = handler.message.bind(global.botMock);
		const testCommands = [
			PING.CMD, INVITE.CMD, HELP.CMD
		];
		const isDevOnly = [false, false, true];
		const testMessages = testCommands.map(cmd => `${global.env.BOT_DEFAULT_PREFIX}${cmd}`);

		global.botMock._commands.set(global.env.BOT_DEFAULT_LANG, new Collection());
		testCommands.forEach((cmd, idx) => {
			const commands = global.botMock._commands.get(global.env.BOT_DEFAULT_LANG)
			commands.set(cmd, {
				devOnly: isDevOnly[idx],
				execute: jest.fn(),
			});
		});

		testMessages.forEach(async (cmd, idx) => {
			const commands = global.botMock._commands.get(global.env.BOT_DEFAULT_LANG)
			const mockFn = commands.get(testCommands[idx]).execute;
			global.msgMock.content = cmd;

			await messageHandler(global.msgMock);
			isDevOnly[idx] ?
				expect(mockFn).not.toBeCalled() :
				expect(mockFn).toBeCalled();
		});
	});

	it('will not send message when message has no prefix', () => {
		global.msgMock.content = '타타루의 접두사가 붙지 않은 문장',
		global.botMock._setLogger();
		global.botMock._loadCommands();
		expect(async () => {
			await handler.message.call(global.botMock, global.msgMock)
		}).not.toThrow();
	});

	it('will not send message when command not exist', () => {
		global.msgMock.content ='타타루 가갖고있지않은명령어';
		global.botMock._setLogger();
		global.botMock._loadCommands();
		expect(async () => {
			await handler.message.call(global.botMock, global.msgMock)
		}).not.toThrow();
	});

	it('will send when error happens, then logs', async () => {
		// intentionally raise error by not giving msg author
		global.msgMock.author.id = null
		global.msgMock.content = '타타루 핑';

		const logSpy = jest.spyOn(global.console, 'log')
			.mockImplementation(() => {});
		global.botMock._setLogger();
		global.botMock._loadCommands();

		await handler.message.call(global.botMock, global.msgMock);
		expect(global.msgMock.channel.sendMock).toBeCalled();
		expect(logSpy).toBeCalled();
	});

	it('will send message when joining guild', () => {
		handler.guildCreate.call(global.botMock, global.guildMock);
		expect(global.guildMock.systemChannel.sendMock).toBeCalled();

		global.guildMock.systemChannel = null,

		expect(handler.guildCreate.bind(global.botMock, guildMock)).not.toThrow();
	});

	it('can find similar command when finding command fails', () => {
		global.msgMock.content = '타타루 팡',
		global.botMock._setLogger();
		global.botMock._loadCommands();
		handler.message.call(global.botMock, global.msgMock)
		expect(global.msgMock.channel.sendMock).toBeCalledWith(BOT.CMD_INFORM_SIMILAR(global.msgMock.author, '핑'));
	});
});
