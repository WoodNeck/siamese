const mongoose = require('mongoose');

module.exports = mongoose.model('Command', new mongoose.Schema({
	name: String,
	callCount: { type: Number, default: 0 },
	avgTime: { type: Number, default: 0 },
}));
