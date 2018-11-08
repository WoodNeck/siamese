const ytdl = require('ytdl-core');
const { DEV } = require('@/constants/message');
const { MUSIC_TYPE } = require('@/constants/type');

module.exports = class Song {
	constructor(musicResolvable, musicType, meta) {
		if (!(musicType in MUSIC_TYPE)) {
			throw new Error(DEV.MUSIC_TYPE_NOT_DEFINED(musicType));
		}

		this._song = musicResolvable;
		this._meta = meta;
		this._type = musicType;
	}

	// is musicResolvable is valid
	// TODO: set valid check fn for each types
	get valid() { return true; }
	get meta() { return this._meta; }

	createStream() {
		switch (this._type) {
		case MUSIC_TYPE.YOUTUBE:
			return ytdl(this._song, { filter : 'audioonly' });
		}
	}
};
