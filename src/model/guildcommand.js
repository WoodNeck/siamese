const mongoose = require('mongoose');

module.exports = mongoose.model('GuildCommand', new mongoose.Schema({
	name: String,
	guildId: String,
	callCount: { type: Number, default: 0 },
}));
