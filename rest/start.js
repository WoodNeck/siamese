const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');

const { checkPermission, hasPermission } = require('./helper');
const Directory = require('../src/model/directory');
const Image = require('../src/model/image');
const DISCORD = require('../src/constants/discord');
const { URL, ERROR } = require('./constants');

module.exports = bot => {
	const app = express();

	// CORS
	app.use((req, res, next) => {
		res.append('Access-Control-Allow-Origin', ['*']);
		res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
		res.append('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	/**
	 * @query
	 * id - user.id
	 *
	 * @return {Object} user info
	 * null if user not exists
	 */
	app.get(URL.USER, async (req, res) => {
		const userId = req.query.id;
		const user = bot.users.get(userId);

		res.json(user);
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
	app.get(URL.GUILDS, async (req, res) => {
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
	 * id - guild.id
	 *
	 * @return {Array} JSON array of directories guild has.
	 * id - directory id
	 * name - directory name
	 * guildId - guild id where it belongs
	 */
	app.get(URL.DIRECTORIES, async (req, res) => {
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
	 * @return {Object} JSON object of directory info
	 * id - directory id
	 * name - directory name
	 * guildId - guild id where it belongs
	 * images - images directory has
	 */
	app.get(URL.DIRECTORY, async (req, res) => {
		const directoryId = req.query.id;
		const directory = await Directory.findById(directoryId) || {};
		const images = await Image.find({
			dirId: directoryId,
		}) || [];

		const dir = Object.assign({
			images,
		}, directory._doc);

		res.json(dir);
	});

	/**
	 * @query
	 * guild - guild.id
	 * user - user.id
	 * name - directory name
	 *
	 * @return
	 * 200 - OK
	 * 301 - Already exists
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 */
	app.post(URL.DIRECTORY, async (req, res) => {
		const { guild: guildId, user: userId, name } = req.body;

		if (!guildId || !userId || !name) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}
		const dirName = name.trim();
		if (dirName.length <= 0 || dirName.length > 8) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send(ERROR.UNAUTHORIZED);
		}

		const dirExists = await Directory.findOne({ name: dirName, guildId }).exec();
		if (dirExists) {
			return res.status(301).send(ERROR.ALREADY_EXISTS('폴더'));
		}

		Directory.updateOne(
			{ name: dirName, guildId, author: userId },
			{},
			{ upsert: true },
		).exec()
			.then(() => res.sendStatus(200))
			.catch(() => res.status(402).send(ERROR.FAILED_TO_CREATE('폴더')));
	});

	/**
	 * @query
	 * guild - guild.id
	 * user - user.id
	 * directory - directory.id
	 * name - new directory name
	 *
	 * @return
	 * 200 - OK
	 * 301 - Directory with same name exists
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - Directory not exists
	 */
	app.patch(URL.DIRECTORY, async (req, res) => {
		const { guild: guildId, user: userId, directory: directoryId, name } = req.body;

		if (!guildId || !userId || !name) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}
		const newName = name.trim();
		if (newName.length <= 0 || newName.length > 8) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send(ERROR.UNAUTHORIZED);
		}

		const dirExists = await Directory.findById(directoryId).exec();
		if (!dirExists) {
			return res.status(404).send(ERROR.NOT_EXISTS('폴더'));
		}

		const alreadyExists = await Directory.findOne({ name: newName, guildId }).exec();
		if (alreadyExists) {
			return res.status(301).send(ERROR.ALREADY_EXISTS('폴더'));
		}

		Directory.findByIdAndUpdate(directoryId, {
			name: newName,
		}).exec()
			.then(() => res.sendStatus(200))
			.catch(() => res.status(402).send(ERROR.FAILED_TO_CHANGE('폴더명')));
	});

	/**
	 * @query
	 * directory - directory.id
	 * guild - guild.id
	 * user - user.id
	 *
	 * @return
	 * 200 - OK
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - Directory not exists
	 */
	app.delete(URL.DIRECTORY, async (req, res) => {
		const { directory: dirId, guild: guildId, user: userId } = req.body;

		if (!guildId || !userId || !dirId) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send(ERROR.UNAUTHORIZED);
		}

		const directory = await Directory.findOne({
			_id: dirId,
			guildId,
		}).exec();
		if (!directory) {
			return res.status(404).send(ERROR.NOT_EXISTS('폴더'));
		}

		directory.remove()
			.then(() => res.sendStatus(200))
			.catch(() => res.status(402).send(ERROR.FAILED_TO_REMOVE('폴더')));

		await Image.deleteMany({
			dirId,
		}).exec();
	});

	/**
	 * @query
	 * id - guild.id
	 *
	 * @return {Array} "default"(dirId is 0) images
	 */
	app.get(URL.IMAGES, async (req, res) => {
		const guildId = req.query.id;

		const images = await Image.find({
			guildId, dirId: 0,
		}).exec();

		res.json(images);
	});

	/**
	 * @query
	 * images - image id array to change directory
	 * guild - guild.id
	 * user - user.id
	 *
	 * @return
	 * 200 - OK
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - Directory not exists
	 */
	app.delete(URL.IMAGES, async (req, res) => {
		const { images, guild: guildId, user: userId } = req.body;
		const imageIds = JSON.parse(images);

		if (!guildId || !userId || !imageIds) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send(ERROR.UNAUTHORIZED);
		}

		Promise.all(imageIds.map(id => {
			return Image.findByIdAndRemove(id).exec();
		})).then(() => res.sendStatus(200))
			.catch(() => res.status(402).send(ERROR.FAILED_TO_REMOVE('이미지')));
	});

	/**
	 * change images directory it belongs to
	 *
	 * @query
	 * user - user.id
	 * guild - guild.id
	 * images - image id array to change directory
	 * directory - directory.id to move images
	 *
	 * @return
	 * 200 - Partially success, returns duplicated ones in json format
	 * 301 - File with same name exists
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - Directory not exists
	 */
	app.patch(URL.IMAGES, async (req, res) => {
		const { guild: guildId, user: userId, images: imageIds, directory } = req.body;

		if (!guildId || !userId || !imageIds) {
			return res.status(400).send('인자가 잘못되었습니다.');
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send('길드에 스탬프관리 권한이 없습니다.');
		}

		if (directory) {
			const targetDir = await Directory.findById(directory);
			if (!targetDir) {
				return res.status(404).send('디렉토리가 존재하지 않습니다.');
			}
		}

		const dirId = directory ? directory : 0;
		const images = await Promise.all(imageIds.map(id => Image.findById(id).exec()))
			.catch(() => undefined);
		if (!images) {
			return res.status(402).send('이미지를 가져오는 중에 오류가 발생했습니다.');
		}
		if (images.some(image => !image)) {
			return res.status(404).send('이미가 존재하지 않습니다.');
		}
		const names = images.map(image => image.name);
		const exists = await Promise.all(names.map(name => Image.findOne({ name: name, dirId }).exec()))
			.catch(() => undefined);
		if (!images) {
			return res.status(402).send('이미지를 가져오는 중에 오류가 발생했습니다.');
		}

		Promise.all(
			images
				.filter((_, index) => !exists[index])
				.map(image => {
					image.dirId = dirId;
					return image.save();
				})
		).then(() => {
			res.json(
				images.map((image, index) => {
					return {
						new: image,
						prev: exists[index],
					};
				}).filter((_, index) => Boolean(exists[index]))
			);
		}).catch(() => {
			return res.status(402).send('이미지를 옮기는데 실패했습니다.');
		});
	});

	/**
	 * Add new image
	 *
	 * @query
	 * guild - guild.id
	 * user - user.id
	 * name - image.name
	 * url - image.url
	 * directory(optional) - directory.id
	 *
	 * @return
	 * 200 - OK
	 * 301 - File with same name exists
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - Directory not exists
	 */
	app.post(URL.IMAGE, async (req, res) => {
		const { guild: guildId, user: userId, name: imageName, url: imageUrl, directory } = req.body;

		if (!guildId || !userId || !imageName || !imageUrl) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		const newName = imageName.trim();
		if (newName.length <= 0 || newName.length > 8) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send(ERROR.UNAUTHORIZED);
		}

		const dirId = directory ? directory : 0;

		const alreadyExists = await Image.findOne({ name: newName, dirId, guildId }).exec();
		if (alreadyExists) {
			return res.status(301).send(ERROR.ALREADY_EXISTS('파일'));
		}

		if (dirId) {
			const dir = await Directory.findById(dirId).exec();
			if (!dir || dir.guildId !== guildId) {
				return res.status(404).send(ERROR.NOT_EXISTS('디렉토리'));
			}
		}

		Image.updateOne(
			{ name: newName, url: imageUrl, guildId, author: userId, dirId },
			{},
			{ upsert: true },
		).exec()
			.then(() => res.sendStatus(200))
			.catch(() => res.status(402).send(ERROR.FAILED_TO_CREATE('파일')));
	});

	/**
	 * Change image name
	 *
	 * @query
	 * guild - guild.id
	 * user - user.id
	 * image - image.id
	 * name - new image name
	 *
	 * @return
	 * 200 - OK
	 * 301 - File with same name exists
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - File not exists
	 */
	app.patch(URL.IMAGE, async (req, res) => {
		const { guild: guildId, user: userId, image: imageId, name } = req.body;

		if (!guildId || !userId || !imageId || !name) {
			return res.status(400).send('인자가 잘못되었습니다.');
		}
		const newName = name.trim();
		if (newName.length <= 0 || newName.length > 8) {
			return res.status(400).send('인자가 잘못되었습니다.');
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send('길드에 스탬프관리 권한이 없습니다.');
		}

		const alreadyExists = await Image.findOne({ name: newName, guildId }).exec();
		if (alreadyExists) {
			return res.status(301).send('이미 동일한 이름의 파일이 존재합니다.');
		}

		Image.findByIdAndUpdate(imageId, {
			name: newName,
		}).exec()
			.then(() => res.sendStatus(200))
			.catch(() => res.status(402).send('파일명 변경에 실패했습니다.'));
	});

	/**
	 * @query
	 * image - image.id
	 * guild - guild.id
	 * user - user.id
	 *
	 * @return
	 * 200 - OK
	 * 400 - Invalid arguments
	 * 401 - Unauthorized
	 * 402 - DB update failed
	 * 404 - Directory not exists
	 */
	app.delete(URL.IMAGE, async (req, res) => {
		const { image: imgId, guild: guildId, user: userId } = req.body;

		if (!guildId || !userId || !imgId) {
			return res.status(400).send(ERROR.INVALID_ARGUMENTS);
		}

		if (!hasPermission(bot, userId, guildId)) {
			return res.status(401).send(ERROR.UNAUTHORIZED);
		}

		const image = await Image.findOne({
			_id: imgId,
			guildId,
		}).exec();
		if (!image) {
			return res.status(404).send(ERROR.NOT_EXISTS('이미지'));
		}

		image.remove()
			.then(() => res.sendStatus(200))
			.catch(() => res.status(402).send(ERROR.FAILED_TO_REMOVE('이미지')));
	});

	app.listen(4260, () => {
		console.log('API server listening on port 4260!');
	});
};
