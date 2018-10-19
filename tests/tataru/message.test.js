const { Collection } = require('discord.js');
const Tataru = require('@/tataru');
const handler = require('@/tataru.on');
const { PING, BOT, INVITE, HELP } = require('@/constants')(global.env.BOT_DEFAULT_LANG);

describe('Message handling', () => {
	let tataru;

	beforeEach(() => {
		tataru = new Tataru();
		tataru.user = {
			username: '타타루',
			setActivity: jest.fn(),
		};
	});

	it('will set logger when ready', () => {
		// disable console.log message
		jest.spyOn(global.console, 'log')
			.mockImplementation(() => {});

		handler.ready.call(tataru);
		expect(tataru.log).not.toBeUndefined();
	});

	it('will log ready msg when ready', () => {
		const logSpy = jest.spyOn(global.console, 'log')
			.mockImplementation(() => {});

		handler.ready.call(tataru);
		expect(logSpy).toBeCalled();
	});

	it('will call proper command', () => {
		const messageHandler = handler.message.bind(tataru);
		const testCommands = [
			PING.CMD, INVITE.CMD, HELP.CMD
		];
		const isDevOnly = [false, false, true];
		const testMessages = testCommands.map(cmd => `${global.env.BOT_DEFAULT_PREFIX}${cmd}`);

		tataru._commands.set(global.env.BOT_DEFAULT_LANG, new Collection());
		testCommands.forEach((cmd, idx) => {
			const commands = tataru._commands.get(global.env.BOT_DEFAULT_LANG)
			commands.set(cmd, {
				devOnly: isDevOnly[idx],
				execute: jest.fn(),
			});
		});

		testMessages.forEach((cmd, idx) => {
			const commands = tataru._commands.get(global.env.BOT_DEFAULT_LANG)
			const mockFn = commands.get(testCommands[idx]).execute;
			const msg = {
				content: cmd,
				author: { id: 0, bot: false },
			};

			messageHandler(msg);
			isDevOnly[idx] ?
				expect(mockFn).not.toBeCalled() :
				expect(mockFn).toBeCalled();
		});
	});

	it('will not send message when message has no prefix', () => {
		const msg = {
			content: '타타루의 접두사가 붙지 않은 문장',
		};
		tataru._setLogger();
		tataru._loadCommands();
		expect(handler.message.bind(tataru, msg)).not.toThrow();
	});

	it('will not send message when command not exist', () => {
		const msg = {
			author: {
				bot: false,
			},
			content: '타타루 가갖고있지않은명령어',
		};
		tataru._setLogger();
		tataru._loadCommands();
		expect(handler.message.bind(tataru, msg)).not.toThrow();
	});

	it('will reply when error happens, then logs', () => {
		const replyMock = jest.fn();
		const msg = {
			// intentionally raise error by not giving msg author
			author: { bot: false },
			content: '타타루 핑',
			guild: { id: 426 },
			channel: { id: 426 },
			reply: replyMock
		};

		const logSpy = jest.spyOn(global.console, 'log')
			.mockImplementation(() => {});
		tataru._setLogger();
		tataru._loadCommands();

		handler.message.call(tataru, msg);
		expect(replyMock).toBeCalled();
		expect(logSpy).toBeCalled();
	});

	it('will send message when joining guild', () => {
		const sendMock = jest.fn();

		let guildMock = {
			systemChannel: {
				send: sendMock,
			},
		};

		handler.guildCreate.call(tataru, guildMock);
		expect(sendMock).toBeCalled();

		guildMock = {
			systemChannel: null,
		};

		expect(handler.guildCreate.bind(tataru, guildMock)).not.toThrow();
	});

	it('can find similar command when finding command fails', () => {
		const msg = {
			author: {
				toString: () => '타타루',
				bot: false,
			},
			content: '타타루 팡',
			channel: {
				send: jest.fn(),
			}
		};

		tataru._setLogger();
		tataru._loadCommands();
		handler.message.call(tataru, msg)
		expect(msg.channel.send).toBeCalledWith(BOT.CMD_INFORM_SIMILAR(msg.author, '핑'));
	});
});
