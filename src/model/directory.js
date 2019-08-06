const mongoose = require('mongoose');

/**
 * name: directory name
 * guildId: guild id it belongs to
 * author: user id who created
 */
module.exports = mongoose.model('Directory', new mongoose.Schema({
	name: String,
	guildId: String,
	author: String,
}));
