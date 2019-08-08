const { finished } = require('stream');
const ERROR = require('@/constants/error');
const { PLAYER } = require('@/constants/message');
const { PLAYER_STATE, LOG_TYPE } = require('@/constants/type');


module.exports = class Player {
	constructor(bot, guild, voiceConnection, textChannel) {
		this._bot = bot;
		this._guild = guild;
		this._textChannel = textChannel;
		this._connection = voiceConnection;
		this._queue = [];
		this._loop = false;
		this._state = PLAYER_STATE.INIT;
	}

	async enqueue(song, channel) {
		this._queue.push(song);

		// Play the song automatically if it's first enqueue
		this._state === PLAYER_STATE.INIT
			? await this._playNextSong()
			: channel.send(PLAYER.ENQUEUE_NEW_SONG(song));
	}

	async enqueueList(playlist, channel) {
		this._queue.push(...playlist.songs);
		if (this._state === PLAYER_STATE.INIT) {
			await this._playNextSong();
		}
		channel.send(PLAYER.ENQUEUE_NEW_LIST(playlist));
	}

	resume() {
		if (this._state === PLAYER_STATE.PAUSED) {
			this._state = PLAYER_STATE.PLAYING;
			this._connection.dispatcher.resume();
		}
	}

	pause() {
		if (this._state === PLAYER_STATE.PLAYING) {
			this._state = PLAYER_STATE.PAUSED;
			this._connection.dispatcher.pause();
		}
	}

	end() {
		this._queue = [];
		if (this._connection.dispatcher) {
			this._connection.dispatcher.end();
		}
		this._connection.disconnect();
		this._bot.players.delete(this._guild.id);
	}

	// return: successfully skipped
	skip() {
		if (this._state === PLAYER_STATE.INIT
			|| this._state === PLAYER_STATE.PREPARING) {
			return false;
		}

		if (this._connection.dispatcher) {
			const dispatcher = this._connection.dispatcher;
			if (dispatcher.paused) {
				// Resume first, so it won't make right after end error
				dispatcher.resume();
			}

			dispatcher.end();
			return true;
		}
		else {
			return false;
		}
	}

	setLoop(bool) {
		this._loop = bool;
	}

	// remove song at index
	async remove(index) {
		return this._queue.splice(index, 1)[0];
	}

	get currentSong() { return this._queue[0]; }
	// Exclude current song
	get queue() { return this._queue.slice(1); }
	get time() {
		return this._connection.dispatcher
			? {
				hours: Math.floor((this._connection.dispatcher.streamTime / 1000) / 3600),
				minutes: Math.floor(((this._connection.dispatcher.streamTime / 1000) % 3600) / 60),
				seconds: Math.floor((this._connection.dispatcher.streamTime / 1000) % 60),
			}
			: {
				hours: 0,
				minutes: 0,
				seconds: 0,
			};
	}
	get state() { return this._state; }
	get loop() { return this._loop; }
	set loop(val) {
		this._loop = val;
	}

	async _playNextSong() {
		this._state = PLAYER_STATE.PREPARING;

		const song = this._queue[0];
		if (!song) {
			return;
		}

		const playNext = (shouldLoop) => {
			const oldSong = this._queue.shift();

			if (shouldLoop) this._queue.push(oldSong);

			this._queue.length > 0
				? setImmediate(() => this._playNextSong())
				: this.end();
		};

		const stream = await song.createStream()
			.catch(err => {
				this._textChannel.send(ERROR.MUSIC.SOMETHING_WRONG_HAPPEND(this.currentSong));
				this._bot.logger.log(LOG_TYPE.ERROR)
					.setTitle(ERROR.MUSIC.SOMETHING_WRONG_HAPPEND(this.currentSong))
					.setDescription(err)
					.send();
			});

		if (!stream) {
			playNext(false);
			return;
		}

		const dispatcher = this._connection.play(stream, song.streamOptions);
		this._state = PLAYER_STATE.PENDING;

		dispatcher.on('start', () => {
			// 'pausedTime' is carried on new dispatcher
			// Should manually set it for 0 to get 0-delay stream after pausing
			// https://github.com/discordjs/discord.js/issues/1693#issuecomment-317301023
			this._connection.player.streamingData.pausedTime = 0;
			this._state = PLAYER_STATE.PLAYING;
			this._textChannel.send(PLAYER.PLAYING_NEW_SONG(song));
		});

		finished(dispatcher, (err) => {
			if (err) {
				this._textChannel.send(ERROR.MUSIC.SOMETHING_WRONG_HAPPEND(this.currentSong));
				this._bot.logger.log(LOG_TYPE.ERROR)
					.setTitle(ERROR.MUSIC.SOMETHING_WRONG_HAPPEND(this.currentSong))
					.setDescription(err)
					.send();
				playNext(false);
			}
			else {
				playNext(this._loop);
			}
		});
	}
};
