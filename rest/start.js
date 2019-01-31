const express = require('express');

module.exports = bot => {
	const app = express();

	// Return user guilds
	app.get('/guilds', (req, res) => {
		const userId = req.query.user.toString();

		const guilds = bot.guilds.filter(guild => {
			return guild.members.some(user => user.id === userId);
		});

		const formattedGuild = guilds.map(guild => {
			return {
				id: guild.id,
				iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
				name: guild.name,
			};
		});

		res.send(JSON.stringify(formattedGuild));
	});

	app.listen(4260, () => {
		console.log('API server listening on port 4260!');
	});
};
