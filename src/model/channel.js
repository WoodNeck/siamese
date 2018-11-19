const mongoose = require('mongoose');


const msgListSchema = mongoose.Schema({
	index: { type: Number, default: 0 },
	snowflakes: { type: [String], capped: { max: 100 } },
}, {
	id: false,
	_id: false,
});

module.exports = mongoose.model('Channel', new mongoose.Schema({
	id: String,
	msgCnt: { type: Number, default: 0 },
	msgs: msgListSchema,
}, {
	id: false,
}));

