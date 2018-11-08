const Discord = require('discord.js');
const FORMAT = require('@/constants/format');
const { DISCORD_ERROR_CODE } = require('@/constants/discord');

module.exports.overrideDiscord = () => {
	const originalSend = Discord.TextChannel.prototype.send;
	Discord.TextChannel.prototype.send = async function(...sendArgs) {
		await this.stopTyping();
		return await originalSend.call(this, ...sendArgs)
			.catch(err => {
				// Not a case of missing permission
				if (!(err instanceof Discord.DiscordAPIError
						&& err.code === DISCORD_ERROR_CODE.MISSING_PERMISSION)) {
					console.error(err);
				}
				return err;
			});
	};

	Discord.Message.prototype.error = async function(errorMsg) {
		return await this.channel.send(`${FORMAT.ERROR_MSG(this.author)}${errorMsg}`);
	};

};
