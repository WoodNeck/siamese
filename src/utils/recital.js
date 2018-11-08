const Book = require('@/utils/book');
const { Collection } = require('discord.js');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const { RECITAL } = require('@/constants/type');


module.exports = class Recital {
	constructor(bot, msg) {
		this._bot = bot;

		this._cmdMsg = msg;
		this._author = msg.author;
		this._channel = msg.channel;
		this._recitalMsg = null;
		this._defaultColor = COLOR.TATARU;

		this._book = new Book();
		this._emojis = [];
		this._callbacks = new Collection();
		this._reactionFilter = (reaction, user) =>
			this._callbacks.has(reaction.emoji.name)
			&& user.id === this._author.id;

		// Default menu
		this.addReactionCallback(EMOJI.ARROW_LEFT, this._prev);
		this.addReactionCallback(EMOJI.ARROW_RIGHT, this._next);
		this.addReactionCallback(EMOJI.CROSS, () => RECITAL.END_AND_DELETE_ALL_MESSAGES);
	}
	// All reaction callbacks must return recital end reason
	// else recital will be end without listening additional reactions
	// reasons are defined in constants
	addReactionCallback(emoji, callback, index) {
		const indexInRange = () => index !== undefined
			&& typeof index === 'number'
			&& Math.floor(index) < this._emojis.length;

		indexInRange()
			? this._emojis.splice(Math.floor(index), 0, emoji)
			: this._emojis.push(emoji);
		this._callbacks.set(emoji, callback.bind(this));
		return this;
	}
	setDefaultColor(color) {
		this._defaultColor = color;
		return this;
	}
	start(maxWaitTime) {
		const firstPage = this._book.firstPage;
		if (firstPage.isEmbed && !firstPage.content.color) {
			firstPage.content.setColor(this._defaultColor);
		}

		this._channel.send(firstPage.content)
			.then(async msg => {
				this._recitalMsg = msg;

				for (const emoji of this._emojis) {
					await this._recitalMsg.react(emoji);
				}

				this._listenReaction(msg, maxWaitTime);
			});
	}
	get book() { return this._book; }
	get currentData() { return this._book.currentData; }

	_listenReaction(msg, maxWaitTime) {
		const reactionCollector = msg.createReactionCollector(this._reactionFilter, { time: maxWaitTime * 1000 });
		reactionCollector.on('collect', reaction => {
			this._onCollect.call(this, reaction, reactionCollector);
		});
		reactionCollector.on('end', this._onEnd.bind(this));
	}
	async _onCollect(reaction, collector) {
		reaction.remove(this._author).catch(() => {});
		const reason = await this._callbacks.get(reaction.emoji.name)();
		collector.stop(reason);
	}
	_onEnd(collection, reason) {
		switch (reason) {
		case RECITAL.SHOULD_NOT_END:
			// Start listening another reaction
			this._listenReaction(this._recitalMsg);
			break;
		case RECITAL.END_AND_DELETE_ALL_MESSAGES:
			this._delete();
			break;
		// By timeout
		// if reason not specified, it returns 'user' which also can be handled on here
		case RECITAL.END_AND_REMOVE_ONLY_REACTIONS:
		default:
			// Removing bot reactions indicates that
			// bot won't listen to reactions anymore
			this._removeBotReactions();
		}
	}
	_prev() {
		// Message could been deleted
		if (!this._recitalMsg || this._recitalMsg.deleted) return;
		const prevPage = this._book.prevPage;
		this._changePage(prevPage);
		return RECITAL.SHOULD_NOT_END;
	}
	_next() {
		// Message could been deleted
		if (!this._recitalMsg || this._recitalMsg.deleted) return;
		const nextPage = this._book.nextPage;
		this._changePage(nextPage);
		return RECITAL.SHOULD_NOT_END;
	}
	_changePage(page) {
		if (page.isEmbed) {
			if (!page.content.color) page.setColor(this._defaultColor);
			this._recitalMsg.edit('', page.content).catch(() => {});
		}
		else {
			this._recitalMsg.edit(page.content).catch(() => {});
		}
	}
	_delete() {
		// Both messages could been deleted manually by user
		// So, it can throw error but don't care about it.
		if (this._cmdMsg && !this._cmdMsg.deleted) {
			this._cmdMsg.delete()
				.catch(() => {});
		}
		if (this._recitalMsg && !this._recitalMsg.deleted) {
			this._recitalMsg.delete()
				.catch(() => {});
		}
	}
	_removeBotReactions() {
		if (!this._recitalMsg.deleted) {
			this._recitalMsg.reactions
				.filter(reaction => reaction.me)
				.tap(reaction => reaction.remove().catch(() => {}));
		}
	}
};
