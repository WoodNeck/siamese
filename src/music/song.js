const ytdl = require('ytdl-core');
const { DEV } = require('@/constants/message');
const { MUSIC_TYPE } = require('@/constants/type');

module.exports = class Song {
	constructor(musicResolvable, musicType, title, duration, member) {
		if (!(musicType in MUSIC_TYPE)) {
			throw new Error(DEV.MUSIC_TYPE_NOT_DEFINED(musicType));
		}

		this._song = musicResolvable;
		this._type = musicType;
		this._title = title;
		this._duration = duration;
		this._member = member;
	}

	// is musicResolvable is valid
	// TODO: set valid check fn for each types
	get valid() { return true; }
	get title() { return this._title; }
	get duration() { return this._duration; }
	get member() { return this._member; }

	createStream() {
		switch (this._type) {
		case MUSIC_TYPE.YOUTUBE:
			return ytdl(this._song, { filter : 'audioonly' });
		}
	}
};
