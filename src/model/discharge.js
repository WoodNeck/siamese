const mongoose = require('mongoose');

module.exports = mongoose.model('Discharge', new mongoose.Schema({
	name: String,
	channelId: String,
	joinDate: Date,
	force: String,
}));
