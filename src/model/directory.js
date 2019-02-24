const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
	name: String,
	path: String,
});

module.exports = mongoose.model('Directory', new mongoose.Schema({
	name: String,
	images: [imageSchema],
}));
