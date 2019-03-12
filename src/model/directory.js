const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
	id: String,
	name: String,
	size: Number,
	url: String,
	deletehash: String,
	author: String,
});

module.exports = mongoose.model('Directory', new mongoose.Schema({
	name: String,
	guildId: String,
	images: { type: [imageSchema], default: [] },
}));
