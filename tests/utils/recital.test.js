const Recital = require('@/utils/recital');
const { EmbedPage, StringPage } = require('@/utils/page');
const { EMOJI, COLOR, RECITAL } = require('@/constants')();


describe('Recital', () => {
	let recital;
	beforeEach(() => {
		recital = new Recital(global.botMock, global.msgMock);
	});

	it('has 3 operations in default', () => {
		expect(recital._callbacks.size).toEqual(3);
	});

	it('has book to recite', () => {
		expect(recital._book).not.toBeUndefined();
		expect(recital._book.constructor.name).toEqual('Book');
	});

	it('can add reaction callback', () => {
		recital.addReactionCallback(EMOJI.TOOLS, jest.fn());
		expect(recital._callbacks.size).toEqual(4);
	});

	it('can filter reactions', () => {
		expect(recital._reactionFilter(global.reactionMock, global.botUserMock)).toEqual(false);
		expect(recital._reactionFilter(global.reactionMock, global.msgMock.author)).toEqual(true);
	});

	it('can override reaction callback', () => {
		const mockFn = jest.fn();
		recital.addReactionCallback(EMOJI.TOOLS, () => {});
		recital.addReactionCallback(EMOJI.TOOLS, mockFn);
		expect(recital._callbacks.size).toEqual(4);
	});

	it('can set default color', () => {
		recital.setDefaultColor(COLOR.ERROR);
		expect(recital._defaultColor).toEqual(COLOR.ERROR);
	});

	it('can start a session', () => {
		global.channelMock.send = content => {
			return new Promise(resolve => {
				resolve(global.msgMock);
			});
		};

		const testPage = new EmbedPage();
		recital.book.addPage(testPage);
		expect(() => { recital.start() }).not.toThrow();
	});

	it('can react to reaction', async () => {
		recital.book.addPage(new StringPage());
		await recital.start();
		await recital._onCollect(global.reactionMock, global.collectorMock);
		expect(global.reactionMock.removeMock).toBeCalled();
		expect(global.collectorMock.stop).toBeCalled();
	});

	it('will act differently to end reason', async () => {
		recital.book.addPage(new StringPage());
		await recital.start();

		recital._listenReaction = jest.fn();
		recital._delete = jest.fn();
		recital._removeBotReactions = jest.fn();

		recital._onEnd([], RECITAL.SHOULD_NOT_END);
		expect(recital._listenReaction).toBeCalled();

		recital._onEnd([], RECITAL.END_AND_DELETE_ALL_MESSAGES);
		expect(recital._delete).toBeCalled();

		recital._onEnd([], RECITAL.END_AND_REMOVE_ONLY_REACTIONS);
		expect(recital._removeBotReactions).toBeCalled();

		recital._onEnd([]);
		// default case
		expect(recital._removeBotReactions).toBeCalled();
	});

	it('can change to a prev page', async () => {
		recital.book.addPage(new StringPage());
		await recital.start();
		recital._prev();
		expect(global.msgMock.editMock).toBeCalled();
	});

	it('can change to a next page', async () => {
		recital.book.addPage(new EmbedPage());
		await recital.start();
		recital._next();
		expect(global.msgMock.editMock).toBeCalled();
	});

	it('can delete message', async () => {
		recital.book.addPage(new EmbedPage());
		await recital.start();
		recital._delete();
		expect(global.msgMock.deleteMock).toBeCalledTimes(2);
	});

	it('can remove bot reactions', async () => {
		recital.book.addPage(new EmbedPage());
		await recital.start();
		recital._removeBotReactions();
		expect(global.reactionMock.removeMock).toBeCalled();
	});
});
