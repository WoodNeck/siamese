// Functions handling client.on() method

const { DEV } = require('./constants');

const onReady = function() {
	console.log(DEV.BOT_READY_MSG(this));
};

const onMessage = function(msg) {
	if (!msg.content.startsWith(this.prefix) || msg.author.bot) return;

	const args = msg.content.slice(this.prefix.length).split(/ +/);
	const command = args.shift();

	if (!this.commands.has(command)) return;

	try {
		this.commands.get(command).execute(msg, args);
	}
	catch (error) {
		console.error(error);
		msg.reply('there was an error trying to execute that command!');
	}
};

module.exports = {
	'ready': onReady,
	'message': onMessage,
};
