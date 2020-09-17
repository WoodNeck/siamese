const date = require('date-and-time');
const DateDiff = require('date-diff');
const { MessageEmbed } = require('discord.js');
const Discharge = require('~/model/discharge');
const { loadSubcommands } = require('~/load/subcommand');
const COLOR = require('~/constants/color');
const ERROR = require('~/constants/error');
const PERMISSION = require('~/constants/permission');
const { DISCHARGE } = require('~/constants/commands/history');


module.exports = {
	name: DISCHARGE.CMD,
	description: DISCHARGE.DESC,
	usage: DISCHARGE.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	subcommands: loadSubcommands('discharge'),
	execute: async ({ channel, guild, msg, content }) => {
		// No multiline is allowed
		const name = content.split('\n')[0];

		if (!name) {
			msg.error(ERROR.CMD.EMPTY_CONTENT(DISCHARGE.TARGET));
			return;
		}
		channel.startTyping();

		const info = await Discharge.findOne({
			name: name,
			guildId: guild.id,
		}).exec();

		if (!info) {
			msg.error(ERROR.DISCHARGE.NOT_FOUND);
			return;
		}

		const details = [];
		details.push(DISCHARGE.FORCE_DETAIL(info.force));

		let endDate = date.addMonths(info.joinDate, DISCHARGE.FORCE_INFO[info.force].duration);
		// Should subtract 1, as 2013/1/2 -> 2015/1/1, not 2015/1/2
		endDate = date.addDays(endDate, -1);
		if (endDate >= DISCHARGE.SHORTEN_AFTER_THIS_DATE) {
			const dateDiff = new DateDiff(endDate, DISCHARGE.SHORTEN_AFTER_THIS_DATE);
			// Subtract 0.1, as it ranges like 0.1 ~ 2.0
			const weekDiff = dateDiff.weeks() - 0.1;
			const daysShorten = Math.floor(weekDiff / 2) + 1;
			endDate = (daysShorten <= DISCHARGE.FORCE_INFO[info.force].maxShortenMonth * 30)
				? date.addDays(endDate, -daysShorten)
				: date.addMonths(endDate, -DISCHARGE.FORCE_INFO[info.force].maxShortenMonth);
			if (daysShorten <= DISCHARGE.FORCE_INFO[info.force].maxShortenMonth * 30) {
				details.push(DISCHARGE.SHORTEN_DATE(daysShorten));
			}
		}

		const now = new Date();
		const total = Math.floor(new DateDiff(endDate, info.joinDate).days());
		let progressed = Math.floor(new DateDiff(now, info.joinDate).days());
		progressed = progressed > total ? total : progressed;

		const percentage = (100 * (progressed / total)).clamp(0, 100);

		details.push(DISCHARGE.JOIN_DATE(info.joinDate));
		details.push(DISCHARGE.DISCHARGE_DATE(endDate));
		details.push(DISCHARGE.DAYS_PROGRESSED(Math.min(progressed, total)));
		details.push(DISCHARGE.DAYS_LEFT(Math.max(total - progressed, 0)));
		details.push(DISCHARGE.PERCENTAGE(percentage));

		const embed = new MessageEmbed()
			.setTitle(DISCHARGE.TITLE(name))
			.setDescription(DISCHARGE.PROGRESS_EMOJI(Math.floor(percentage)))
			.setColor(COLOR.BOT)
			.addField(DISCHARGE.DETAILED, details.join('\n'));
		channel.send(embed);
	},
};
