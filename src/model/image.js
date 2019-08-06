const mongoose = require('mongoose');

/**
 * name: image name
 * url: image url in imgur
 * guildId: directory id where it belongs
 * author: user id who uploaded
 * dirId: directory id where it belongs
 */
module.exports = mongoose.model('Image', new mongoose.Schema({
	name: String,
	url: String,
	guildId: String,
	author: String,
	dirId: String,
}));
