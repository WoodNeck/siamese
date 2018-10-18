const Logger = require('@/utils/logger');
const { LOG, COLOR } = global.CONSTANT;


const invalidStrings = [null, undefined, '', '   ', '\t', '\n']
describe('Logger', () => {
	let botMock;
	beforeAll(() => {
		botMock = {
			channels: new Map(),
		};
		botMock.channels.set(1, 'Channel1');
		botMock.channels.set(2, 'Channel2');
	});

	it('can be instantized with proper logging modes', () => {
		const logger = new Logger(botMock);

		for (const mode in LOG) {
			const modeStr = LOG[mode];

			expect(() => {
				logger.log.call(logger, modeStr);
			}).not.toThrow();
		}
	});

	it('can\'t be instantized with proper logging modes', () => {
		const logger = new Logger(botMock);
		const invalidModes = [undefined, '', ' ', '??', '타타루'];

		for (const mode in invalidModes) {
			expect(() => {
				logger.log.call(logger, mode);
			}).toThrow();
		}
	});

	it('instantize proper subclass logger', () => {
		let logger = new Logger(botMock, {
			verbose: 1,
			error: 0
		});

		expect(logger.log.call(logger, LOG.VERBOSE).constructor.name)
			.toEqual('EmbedLog');
		expect(logger.log.call(logger, LOG.ERROR).constructor.name)
			.toEqual('StringLog');

		logger = new Logger(botMock, {
			verbose: 3,
			error: 2
		});

		expect(logger.log.call(logger, LOG.VERBOSE).constructor.name)
			.toEqual('StringLog');
		expect(logger.log.call(logger, LOG.ERROR).constructor.name)
			.toEqual('EmbedLog');
	});
});

describe('EmbedLog', () => {
	let embedLog;
	const resetLog = mode => {
		const botMock = {
			channels: new Map(),
		};
		botMock.channels.set(1, 'Channel1');
		botMock.channels.set(2, 'Channel2');
		embedLog = new Logger(botMock, {
			verbose: 1, error: 2
		}).log(mode);
	};
	beforeEach(() => {
		resetLog(LOG.VERBOSE);
	});

	it('is EmbedLog', () => {
		expect(embedLog.constructor.name).toEqual('EmbedLog');
	});

	it('can set title properly', () => {
		const title = '타타루 제목';
		embedLog.setTitle(title);
		expect(embedLog._embed.title).toEqual(title);

		invalidStrings.forEach(text => {
			resetLog(LOG.VERBOSE);
			embedLog.setTitle(text);
			expect(embedLog._embed.title).toBeUndefined();
		});
	});

	it('can set description properly', () => {
		const desc = '타타루 내용';
		embedLog.setDescription(desc);
		expect(embedLog._embed.description).toEqual(desc);

		invalidStrings.forEach(text => {
			resetLog(LOG.VERBOSE);
			embedLog.setDescription(text);
			expect(embedLog._embed.description).toBeUndefined();
		});
	});

	it('can set thumbnail properly', () => {
		const thumb = 'https://some.url/to/tataru/image.png';
		embedLog.setThumbnail(thumb);
		expect(embedLog._embed.thumbnail.url).toEqual(thumb);

		invalidStrings.forEach(text => {
			resetLog(LOG.VERBOSE);
			embedLog.setThumbnail(text);
			expect(embedLog._embed.thumbnail).toBeUndefined();
		});

		const invalidUrls = [
			'htt://www.google.com',
			'://www.google.com',
			'ftp://www.google.com'
		];

		invalidUrls.forEach(text => {
			resetLog(LOG.VERBOSE);
			embedLog.setThumbnail(text);
			expect(embedLog._embed.thumbnail).toBeUndefined();
		});
	});

	it('can set color', () => {
		const colors = ['#deadbf', 0xdeadbf];
		const expected = [0xdeadbf, 0xdeadbf]

		colors.forEach((col, idx) => {
			embedLog.setColor(col);
			expect(embedLog._embed.color).toEqual(expected[idx]);
		});
	});

	it('can send message to channel', () => {
		const mockSend = jest.fn();

		embedLog._channel = { send: mockSend };
		embedLog.send();
		expect(mockSend).toBeCalled();
	});

	it('will set default color before sending', () => {
		const mockSend = jest.fn();

		resetLog(LOG.VERBOSE);
		embedLog._channel = { send: mockSend };
		embedLog.send();
		expect(`#${embedLog._embed.color.toString(16).toLowerCase()}`).toEqual(COLOR.VERBOSE.toLowerCase());

		resetLog(LOG.ERROR);
		embedLog._channel = { send: mockSend };
		embedLog.send();
		expect(`#${embedLog._embed.color.toString(16).toLowerCase()}`).toEqual(COLOR.ERROR.toLowerCase());
	});

	it('will return StringLog with all values if it is intented to print in console', () => {
		const title = '타타루 제목';
		const desc = '타타루 설명';
		const thumb = 'https://타타루.섬네일/tataru.png';
		const color = '#deadbf';

		let newLog = embedLog.setTitle(title)
			.setDescription(desc)
			.setThumbnail(thumb)
			.setColor(color)
			.atConsole();
		expect(newLog._msg.title).toEqual(title);
		expect(newLog._msg.desc).toEqual(desc);
		expect(`${newLog._msg.color.toString(16).toLowerCase()}`).toEqual(color);

		// invariant to atConsole called pos
		resetLog(LOG.VERBOSE);
		newLog = embedLog.atConsole()
			.setTitle(title)
			.setDescription(desc)
			.setThumbnail(thumb)
			.setColor(color);
		expect(newLog._msg.title).toEqual(title);
		expect(newLog._msg.desc).toEqual(desc);
		expect(`${newLog._msg.color.toString(16).toLowerCase()}`).toEqual(color);
	});
});

describe('StringLog', () => {
	let stringLog;
	const resetLog = mode => {
		const botMock = {
			channels: new Map(),
		};
		botMock.channels.set(1, 'Channel1');
		botMock.channels.set(2, 'Channel2');
		// it will return StringLog, which logs to console.log
		// as channels given not listed in bot's channels
		stringLog = new Logger(botMock, {
			verbose: 3, error: 4
		}).log(mode);
	};
	beforeEach(() => {
		resetLog(LOG.VERBOSE);
	});

	it('is StringLog', () => {
		expect(stringLog.constructor.name).toEqual('StringLog');
	});

	it('can set title properly', () => {
		const title = '타타루 제목';
		stringLog.setTitle(title);
		expect(stringLog._msg.title).toEqual(title);

		invalidStrings.forEach(text => {
			resetLog(LOG.VERBOSE);
			stringLog.setTitle(text);
			expect(stringLog._msg.title).toBeNull();
		});
	});

	it('can set description properly', () => {
		const desc = '타타루 내용';
		stringLog.setDescription(desc);
		expect(stringLog._msg.desc).toEqual(desc);

		invalidStrings.forEach(text => {
			resetLog(LOG.VERBOSE);
			stringLog.setDescription(text);
			expect(stringLog._msg.title).toBeNull();
		});
	});

	it('doesn\'t set thumbnail', () => {
		const thumb = 'https://some.url/to/tataru/image.png';
		stringLog.setThumbnail(thumb);
		expect(stringLog._msg.thumbnail).toBeUndefined();
	});

	it('can set color', () => {
		const colors = ['#deadbf', 0xdeadbf];

		colors.forEach((col, idx) => {
			stringLog.setColor(col);
			expect(stringLog._msg.color).toEqual(col);
		});
	});

	it('can send message to console', () => {
		const logSpy = jest.spyOn(global.console, 'log')
			.mockImplementation(() => {});
		stringLog
			.setTitle('SOME TITLE')
			.setDescription('SOME DESCRIPTION')
			.send();
		expect(logSpy).toBeCalledTimes(3);
	});

	it('will set default color before sending', () => {
		const mockSend = jest.fn();

		resetLog(LOG.VERBOSE);
		stringLog._channel = { send: mockSend };
		stringLog.send();
		expect(stringLog._msg.color).toEqual(COLOR.VERBOSE.toLowerCase());

		resetLog(LOG.ERROR);
		stringLog._channel = { send: mockSend };
		stringLog.send();
		expect(stringLog._msg.color).toEqual(COLOR.ERROR.toLowerCase());
	});

	it('will return itself if it is intented to print in console', () => {
		const title = '타타루 제목';
		const desc = '타타루 설명';
		const thumb = 'https://타타루.섬네일/tataru.png';
		const color = '#deadbf';

		let newLog = stringLog.setTitle(title)
			.setDescription(desc)
			.setThumbnail(thumb)
			.setColor(color)
			.atConsole();
		expect(newLog).toEqual(stringLog);

		// invariant to atConsole called pos
		resetLog(LOG.VERBOSE);
		newLog = stringLog.atConsole()
			.setTitle(title)
			.setDescription(desc)
			.setThumbnail(thumb)
			.setColor(color);
		expect(newLog).toEqual(stringLog);
	});
});

