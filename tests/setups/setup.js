const { Collection } = require('discord.js');
const { EMOJI } = require('@/constants')();
// Reset before every test case

// Default: test 'kr' lang
global.env = {
	BOT_TOKEN: 'TATARU',
	BOT_DEFAULT_PREFIX: '타타루 ',
	BOT_DEFAULT_LANG: 'kr',

	BOT_VERBOSE_CHANNEL: 1,
	BOT_ERROR_CHANNEL: 2,
};
global.CONSTANT = require('@/constants')(global.env.BOT_DEFAULT_LANG);
global.invalidStrings = [null, undefined, '', '   ', '\t', '\n']
global.invalidUrls = [
	'htt://www.google.com',
	'://www.google.com',
	'ftp://www.google.com'
];

global.logSpy = jest.spyOn(global.console, 'log')
	.mockImplementation(() => {});
global.errorSpy = jest.spyOn(global.console, 'error')
	.mockImplementation(() => {});

const Tataru = require('@/tataru');
// Mockups
global.botUserMock = {
	id: 886,
	username: '타타루',
	toString: () => '@타타루',
	setActivity: jest.fn()
};

global.botMock = new Tataru();
global.botMock.user = global.botUserMock;
global.botMock.channels.set(1, 'Channel1');
global.botMock.channels.set(2, 'Channel2');

const sendMock = jest.fn();
const typeStartMock = jest.fn();
const typeStopMock = jest.fn();
global.channelMock = {
	id: 426,
	send: (arg) => {
		sendMock(arg);
		return new Promise((resolve, reject) => {
			resolve();
			reject();
		});
	},
	sendMock: sendMock,
	startTyping: async () => { typeStartMock(); },
	stopTyping: async () => { typeStopMock(); },
	typeStartMock: typeStartMock,
	typeStopMock: typeStopMock,
};

global.guildMock = {
	id: 426,
	systemChannel: global.channelMock,
};

const removeMock = jest.fn();
global.reactionMock = {
	me: true,
	emoji: {
		name: EMOJI.CROSS,
	},
	filter: () => global.reactionMock,
	remove: () => {
		removeMock();
		return new Promise((resolve, reject) => {
			resolve();
			reject();
		});
	},
	removeMock: removeMock,
};

global.collectorMock = {
	stop: jest.fn(),
};

const editMock = jest.fn();
const deleteMock = jest.fn();
global.msgMock = {
	content: '',
	author: { id: 0, bot: false, toString: () => '타타루' },
	guild: global.guildMock,
	channel: global.channelMock,
	reply: jest.fn(),
	react: jest.fn(),
	edit: () => {
		editMock();
		return new Promise((resolve, reject) => {
			resolve();
			reject();
		});
	},
	editMock: editMock,
	delete: () => {
		deleteMock();
		return new Promise((resolve, reject) => {
			resolve();
			reject();
		});
	},
	deleteMock: deleteMock,
	deleted: false,
	createReactionCollector: () => {
		return {
			on: jest.fn()
		};
	},
	reactions: new Collection()
		.set('a', global.reactionMock)
		.set('b', global.reactionMock),
};

global.cmdObjMock = {
	bot: global.botMock,
	content: global.msgMock.content,
	msg: global.msgMock,
	author: global.msgMock.author,
	guild: global.msgMock.guild,
	channel: global.msgMock.channel,
	args: [],
	locale: global.env.BOT_DEFAULT_LANG,
};


// Mock axios, so make it won't send network message
jest.mock('axios');
const axios = require('axios');
axios.get = () => {
	return new Promise((resolve, reject) => {
		resolve({
			data: 'SOME_DATA',
		});
		reject();
	});
}
