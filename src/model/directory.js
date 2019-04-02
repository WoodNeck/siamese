const mongoose = require('mongoose');

module.exports = mongoose.model('Directory', new mongoose.Schema({
	name: String,
	guildId: String,
}));
