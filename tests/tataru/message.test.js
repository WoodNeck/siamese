const { Collection } = require('discord.js');
const handler = require('@/tataru.on');
const { PING, BOT, INVITE, HELP } = require('@/constants')(global.env.BOT_DEFAULT_LANG);
const { makeBotMock, makeMessageMock, makeGuildMock } = require('../setups/mock');


describe('Message handling', () => {
	let tataru;
	beforeEach(() => {
		tataru = makeBotMock();
	})

	it('will set logger when ready', () => {
		handler.ready.call(tataru);
		expect(tataru.log).not.toBeUndefined();
	});

	it('will log ready msg to console when ready', () => {
		handler.ready.call(tataru);
		expect(console.log).toBeCalled();
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

		testMessages.forEach(async (cmd, idx) => {
			const commands = tataru._commands.get(global.env.BOT_DEFAULT_LANG)
			const mockFn = commands.get(testCommands[idx]).execute;
			const msg = makeMessageMock();
			msg.content = cmd;

			await messageHandler(msg);
			isDevOnly[idx] ?
				expect(mockFn).not.toBeCalled() :
				expect(mockFn).toBeCalled();
		});
	});

	it('will not send message when message has no prefix', () => {
		const msg = makeMessageMock();
		msg.content = '타타루의 접두사가 붙지 않은 문장',
		tataru._setLogger();
		tataru._loadCommands();
		expect(async () => {
			await handler.message.call(tataru, msg);
		}).not.toThrow();
	});

	it('will not send message when command not exist', () => {
		const msg = makeMessageMock();
		msg.content ='타타루 가갖고있지않은명령어';
		tataru._setLogger();
		tataru._loadCommands();
		expect(async () => {
			await handler.message.call(tataru, msg)
		}).not.toThrow();
	});

	it('will send when error happens, then logs', async () => {
		// intentionally raise error by not giving msg author
		const msg = makeMessageMock();
		msg.author.id = null
		msg.content = '타타루 핑';

		tataru._setLogger();
		tataru._loadCommands();

		await handler.message.call(tataru, msg);
		expect(msg.channel.send).toBeCalled();
		expect(console.log).toBeCalled();
	});

	it('will send message when joining guild', () => {
		const guild = makeGuildMock();
		handler.guildCreate.call(tataru, guild);
		expect(guild.systemChannel.send).toBeCalled();

		guild.systemChannel = null,

		expect(handler.guildCreate.bind(tataru, guild)).not.toThrow();
	});

	it('can find similar command when finding command fails', () => {
		const msg = makeMessageMock();
		msg.content = '타타루 팡',
		tataru._setLogger();
		tataru._loadCommands();
		handler.message.call(tataru, msg)
		expect(msg.channel.send).toBeCalledWith(BOT.CMD_INFORM_SIMILAR(msg.author, '핑'));
	});
});
