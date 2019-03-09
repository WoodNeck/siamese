const ytdl = require('ytdl-core-discord');
const toReadableStream = require('to-readable-stream');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const { MUSIC_TYPE } = require('@/constants/type');

module.exports = class Song {
	constructor(musicResolvable, musicType, title, duration, member) {
		if (!(musicType in MUSIC_TYPE)) {
			throw new Error(ERROR.MUSIC.TYPE_NOT_DEFINED(musicType));
		}

		this._song = musicResolvable;
		this._type = musicType;
		this._title = title;
		this._duration = duration;
		this._member = member;
	}

	// is musicResolvable is valid
	get valid() { return true; }
	get title() { return this._title; }
	get duration() { return this._duration; }
	get member() { return this._member; }
	get emoji() {
		switch (this._type) {
		case MUSIC_TYPE.YOUTUBE:
			return EMOJI.MUSIC_NOTE;
		case MUSIC_TYPE.TTS:
			return EMOJI.SPEAKING_HEAD;
		}
		return '';
	}
	get streamOptions() {
		switch (this._type) {
		case MUSIC_TYPE.YOUTUBE:
			return {
				type: 'opus',
				bitrate: 'auto',
			};
		case MUSIC_TYPE.TTS:
			return {
				type: 'ogg/opus',
				bitrate: 'auto',
			};
		}
		return {};
	}

	async createStream() {
		if (this._type === MUSIC_TYPE.YOUTUBE) {
			return await ytdl(this._song, { filter : 'audioonly' });
		}
		else if (this._type === MUSIC_TYPE.TTS) {
			const ttsClient = new TextToSpeechClient();
			const request = {
				input: { text: this._song },
				voice: { languageCode: 'ko-KR' },
				audioConfig: { audioEncoding: 'OGG_OPUS' },
			};
			const [response] = await ttsClient.synthesizeSpeech(request);
			return toReadableStream(response.audioContent);
		}
	}
};
