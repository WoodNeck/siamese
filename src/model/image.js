const mongoose = require('mongoose');

/**
 * id: image id
 * name: image name
 * size: image size in bytes
 * url: image url in imgur
 * deletehash: delete hash for imgur
 * author: user id who uploaded
 * directory: directory id where it belongs
 */
module.exports = mongoose.model('Image', new mongoose.Schema({
	id: String,
	name: String,
	size: Number,
	url: String,
	deletehash: String,
	author: String,
	directory: String,
}));
