const Recital = require('@/utils/recital');
const { EmbedPage, StringPage } = require('@/utils/page');
const { EMOJI, COLOR, RECITAL } = require('@/constants')();
const { makeBotUserMock, makeBotMock, makeMessageMock, makeReactionMock, makeCollectorMock } = require('../setups/mock');


describe('Recital', () => {
	let recital;
	beforeEach(() => {
		const tataru = makeBotMock();
		const msg = makeMessageMock();
		msg.channel.send = jest.fn(() => {
			return new Promise(resolve => {
				resolve(makeMessageMock());
			});
		});
		recital = new Recital(tataru, msg);
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
		const reaction = makeReactionMock();
		const notMsgUser = makeBotUserMock();
		expect(recital._reactionFilter(reaction, notMsgUser)).toEqual(false);
		expect(recital._reactionFilter(reaction, recital._author)).toEqual(true);
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

	it('can start a session', async () => {
		const testPage = new EmbedPage();
		recital.book.addPage(testPage);
		expect(() => { recital.start() }).not.toThrow();
	});

	it('can react to reaction', async () => {
		const reaction = makeReactionMock();
		const collector = makeCollectorMock();
		recital.book.addPage(new StringPage());
		recital.start();
		await recital._onCollect(reaction, collector);
		expect(reaction.remove).toBeCalled();
		expect(collector.stop).toBeCalled();
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
		expect(recital._recitalMsg.edit).toBeCalled();
	});

	it('can change to a next page', async () => {
		recital.book.addPage(new EmbedPage());
		await recital.start();
		recital._next();
		expect(recital._recitalMsg.edit).toBeCalled();
	});

	it('can delete message', async () => {
		recital.book.addPage(new EmbedPage());
		await recital.start();
		recital._delete();
		expect(recital._cmdMsg.delete).toBeCalled();
		expect(recital._recitalMsg.delete).toBeCalled();
	});

	it('can remove bot reactions', async () => {
		// Bot will remove own reaction
		const mockReaction = makeReactionMock();
		mockReaction.me = true;

		recital.book.addPage(new EmbedPage());
		await recital.start();
		recital._recitalMsg.reactions.set('SOME_EMOJI', mockReaction)

		recital._removeBotReactions();
		expect(mockReaction.remove).toBeCalled();
	});
});
