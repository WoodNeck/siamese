const { PLAYER } = require('@/constants/message');
const { PLAYER_STATE } = require('@/constants/type');


module.exports = class Player {
	constructor(voiceConnection, textChannel, voiceChannel) {
		this._channels = {
			text: textChannel,
			voice: voiceChannel,
		};
		this._connection = voiceConnection;
		this._queue = [];
		this._loop = false;
		this._state = PLAYER_STATE.INIT;
	}

	enqueue(song) {
		this._queue.push(song);

		// Play the song automatically if it's first enqueue
		if (this._state === PLAYER_STATE.INIT) {
			this._play();
		}
	}

	setLoop(bool) {
		this._loop = bool;
	}

	_play() {
		this._state = PLAYER_STATE.PLAYING;

		const song = this._queue[0];
		const stream = song.createStream();
		const streamOptions = { seek: 0, volume: 1 };
		this._connection.playStream(stream, streamOptions);
		this._channels.text.send(PLAYER.PLAYING_NEW_SONG(song));
	}
};
