const express = require('express');
const Directory = require('../src/model/directory');

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
	app.get('/userGuilds', async (req, res) => {
		const userId = req.query.user;

		const guilds = bot.guilds.filter(guild => guild.members.has(userId));

		const getGuildInfo = async guild => {
			const user = guild.members.get(userId);
			const hasPermission = guild.roles.some(
				role => {
					return role.name === global.env.FILE_MANAGEMENT_ROLE_NAME
						&& user.roles.has(role.id);
				},
			);

			const directories = await Directory.find({
				guildId: guild.id,
			});

			// Include only name & length of directories
			directories.map(directory => {
				return {
					name: directory.name,
					length: directory.images.length,
				};
			});

			return {
				id: guild.id,
				iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
				name: guild.name,
				hasPermission,
				directories,
			};
		};

		const getGuildsInfo = guilds.map(guild => getGuildInfo(guild));

		const formattedGuilds = await Promise.all(getGuildsInfo);
		res.send(JSON.stringify(formattedGuilds));
	});

	app.listen(4260, () => {
		console.log('API server listening on port 4260!');
	});
};
