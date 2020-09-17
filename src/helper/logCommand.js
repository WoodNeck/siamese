const Command = require('~/model/command');
const GuildCommand = require('~/model/guildcommand');


module.exports = async (cmdName, msg, execTime) => {
	// Update per-guild command data
	GuildCommand.findOneAndUpdate(
		{ name: cmdName, guildId: msg.guild.id },
		{ '$inc': { callCount: 1 } },
		{ upsert: true, setDefaultsOnInsert: true }
	).exec();

	// Update global command data
	const command = await Command.findOneAndUpdate(
		{ name: cmdName },
		{ '$inc': { callCount: 1 } },
		{ upsert: true, new: true, setDefaultsOnInsert: true }
	).exec();

	// Average command executeTime
	command.avgTime = (command.avgTime * (command.callCount - 1) + execTime) / command.callCount;

	await command.save();

	// Daily command data
	await Command.findOneAndUpdate(
		{ name: cmdName, time: new Date().toDateString() },
		{ '$inc': { callCount: 1 } },
		{ upsert: true, setDefaultsOnInsert: true }
	).exec();
};
