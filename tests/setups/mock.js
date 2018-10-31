const { Collection } = require('discord.js');
const { EMOJI } = require('@/constants')();


const makeBotUserMock = () => {
	return {
		id: 498710515560742924,
		username: '타타루',
		toString: () => '<@498710515560742924>',
		setActivity: jest.fn(),
	};
};

const makeBotMock = () => {
	const Tataru = require('@/tataru');

	const bot = new Tataru();
	bot.user = makeBotUserMock();
	bot.channels.set(1, 'Channel1');
	bot.channels.set(2, 'Channel2');
	return bot;
};

const makeChannelMock = () => {
	return {
		id: 498712873833332747,
		send: jest.fn(() => {
			return new Promise(async resolve => {
				await resolve();
			});
		}),
		startTyping: jest.fn(() => {}),
		stopTyping: jest.fn(() => {}),
	};
};

const makeGuildMock = () => {
	return {
		id: 498712729381634058,
		systemChannel: makeChannelMock(),
	};
};

const makeReactionMock = () => {
	return {
		me: true,
		emoji: {
			name: EMOJI.CROSS,
		},
		remove: jest.fn(() => {
			return new Promise(resolve => {
				resolve();
			});
		}),
	};
};

const makeCollectorMock = () => {
	return {
		on: jest.fn(),
		stop: jest.fn(),
	};
};

const makeUserMock = () => {
	return {
		id: 426,
		bot: false,
		toString: () => '<@426>',
	};
};

const makeMessageMock = () => {
	return {
		content: '',
		author: makeUserMock(),
		guild: makeGuildMock(),
		channel: makeChannelMock(),
		reply: jest.fn(),
		react: jest.fn(),
		edit: jest.fn(() => {
			return new Promise(resolve => {
				resolve();
			});
		}),
		delete: jest.fn(() => {
			return new Promise(resolve => {
				resolve();
			});
		}),
		deleted: false,
		createReactionCollector: () => makeCollectorMock(),
		reactions: new Collection()
			.set('a', makeReactionMock())
			.set('b', makeReactionMock()),
	}
};

const makeContextMock = async () => {
	const msg = makeMessageMock();
	const bot = makeBotMock();
	await bot._loadCommands();
	return {
		bot: bot,
		content: msg.content,
		msg: msg,
		author: msg.author,
		guild: msg.guild,
		channel: msg.channel,
		args: [],
		locale: global.env.BOT_DEFAULT_LANG,
	};
};

module.exports = {
	makeBotUserMock: makeBotUserMock,
	makeBotMock: makeBotMock,
	makeChannelMock: makeChannelMock,
	makeGuildMock: makeGuildMock,
	makeReactionMock: makeReactionMock,
	makeCollectorMock: makeCollectorMock,
	makeUserMock: makeUserMock,
	makeMessageMock: makeMessageMock,
	makeContextMock: makeContextMock,
}
