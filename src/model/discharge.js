const mongoose = require('mongoose');

module.exports = mongoose.model('Discharge', new mongoose.Schema({
	name: String,
	serverId: String,
	joinDate: Date,
	force: String,
}));
