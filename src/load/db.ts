import chalk from "chalk";
import mongoose from "mongoose";
import DB from "~/consts/db";


const chalk = require("chalk");
const mongoose = require("mongoose");
const DB = require("~/constants/db");
const ERROR = require("~/constants/error");
const { LOG_TYPE } = require("~/constants/type");

const loadDatabase = async bot => {
	await mongoose.connect(DB.URI, {
		autoIndex: false,
		useNewUrlParser: true,
		useFindAndModify: false,
	}).catch(err => {
		console.error(chalk.bold.red(ERROR.DB.FAILED_TO_CONNECT));
		console.error(chalk.dim(err.toString()));
		throw err;
	});

	const db = mongoose.connection;
	db.on("error", async err => {
		await bot.logger.log(LOG_TYPE.ERROR)
			.setTitle(ERROR.DB.GOT_AN_ERROR)
			.setDescription(err.toString())
			.send();
	});

	return db;
};

module.exports = {
	loadDatabase: loadDatabase,
};
