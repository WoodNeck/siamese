const mongoose = require('mongoose');

module.exports = mongoose.model('Guild', new mongoose.Schema({
	id: String,
	announceChannel: String,
	listenAnnounce: { type: Boolean, default: true },
}, {
	id: false,
}));
