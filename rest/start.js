const express = require('express');

module.exports = bot => {
	const app = express();

	// CORS
	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', ['*']);
		res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	// Return user guilds
	app.get('/guilds', (req, res) => {
		const userId = req.query.user;

		const guilds = bot.guilds.filter(guild => guild.members.has(userId));

		const formattedGuild = guilds.map(guild => {
			return {
				id: guild.id,
				iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
				name: guild.name,
			};
		});

		res.send(JSON.stringify(formattedGuild));
	});

	// Return user permission for guild
	app.get('/role', (req, res) => {
		const guildId = req.query.guild;
		const userId = req.query.user;

		const guild = bot.guilds.get(guildId);

		if (guild) {
			const user = guild.members.get(userId);
			if (!user) {
				res.send({});
				return;
			}

			const hasPermission = guild.roles.some(
				role => {
					return role.name === global.env.FILE_MANAGEMENT_ROLE_NAME
						&& user.roles.has(role.id);
				},
			);

			res.send({
				id: guild.id,
				iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
				name: guild.name,
				hasPermission,
			});
		}
		else {
			res.send({});
		}
	});

	app.listen(4260, () => {
		console.log('API server listening on port 4260!');
	});
};
