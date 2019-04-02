const express = require('express');

const { checkPermission } = require('./helper');
const Directory = require('../src/model/directory');
const Image = require('../src/model/image');
const DISCORD = require('../src/constants/discord');

module.exports = bot => {
	const app = express();

	// CORS
	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', ['*']);
		res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	/**
	 * @query
	 * id - user.id
	 *
	 * @return {Array} guilds - JSON array of guilds user is in
	 * id - guild.id
	 * iconURL - guild's png icon url
	 * name - guild.name
	 * hasPermission - Boolean value whether user have permission to manage file
	 */
	app.get('/guilds', async (req, res) => {
		const userId = req.query.id;

		const guilds = bot.guilds
			.filter(guild => guild.members.has(userId))
			.map(guild => {
				const user = guild.members.get(userId);

				return {
					id: guild.id,
					iconURL: DISCORD.URL.GUILD_ICON(guild.id, guild.icon),
					name: guild.name,
					hasPermission: checkPermission(user, guild),
				};
			});

		res.json(guilds);
	});

	/**
	 * @query
	 * user - user.id
	 * guild - guild.id
	 *
	 * @return {Boolean} Whether user has file management permission in guild
	 */
	app.get('/permission', async (req, res) => {
		const userId = req.query.user;
		const guildId = req.query.guild;

		const guild = bot.guilds.get(guildId);
		const user = guild && guild.members.get(userId);

		const hasPermission = guild && user && checkPermission(user, guild);

		res.send(hasPermission);
	});

	/**
	 * @query
	 * id - guild.id
	 *
	 * @return {Array} JSON string of directories guild has.
	 * id - directory id
	 * name - directory name
	 * guildId - guild id where it belongs
	 */
	app.get('/directory', async (req, res) => {
		const guildId = req.query.id;
		const directories = await Directory.find({
			guildId,
		});

		res.json(directories);
	});

	/**
	 * @query
	 * id - directory id
	 *
	 * @return {Array} JSON string of images directory has
	 */
	app.get('/images', async (req, res) => {
		const directoryId = req.query.id;
		const images = await Image.find({
			directory: directoryId,
		});

		res.json(images);
	});

	app.listen(4260, () => {
		console.log('API server listening on port 4260!');
	});
};
