const { MessageEmbed } = require('discord.js');
const { createCanvas } = require('canvas');

const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { LADDER } = require('@/constants/commands/useful');
const { COOLDOWN } = require('@/constants/type');


module.exports = {
	name: LADDER.CMD,
	description: LADDER.DESC,
	usage: LADDER.USAGE,
	hidden: false,
	devOnly: false,
	permissions: [
		PERMISSION.EMBED_LINKS,
	],
	cooldown: COOLDOWN.PER_CHANNEL(5),
	execute: async ({ msg, channel, guild, args }) => {
		if (args.length === 0) {
			const embed = new MessageEmbed()
				.setTitle(LADDER.COMPETERS_TITLE)
				.setDescription(LADDER.COMPETERS_DESC)
				.setFooter(LADDER.COMPETERS_FOOTER)
				.setColor(COLOR.BOT);
			channel.send(embed);
			return;
		}

		if (args.length < 2 || args.length > 10) {
			msg.error(ERROR.LADDER.COMPETERS_BETWEEN_2_10);
			return;
		}

		channel.startTyping();

		// Fetch user mentions
		const competents = args.map(arg => {
			let snowflake = /^<@!?(\d+)>$/.exec(arg);
			snowflake = snowflake ? snowflake[1] : null;
			return snowflake && guild.members.has(snowflake)
				? guild.members.get(snowflake)
				: arg;
		});

		// Ranks
		const ranks = new Array(competents.length)
			.fill(0)
			.map((val, idx) => idx + 1)
			.shuffle();

		const gapPerEntry = Math.floor(250 / args.length);
		const imageY = gapPerEntry * args.length;
		const fontSize = 14;
		const paddingX = 5;
		const paddingY = 10;
		const strokeMinY = 30;
		const strokeMaxY = imageY - strokeMinY;
		const gapPerStroke = 10;
		const strokePossibility = 0.5;
		const maxStrokes = Math.floor((strokeMaxY - strokeMinY) / gapPerStroke) + 1;

		// Horizontal lines
		const strokes = [];

		[...Array(maxStrokes).keys()].forEach(() => {
			const currentRow = Array(competents.length).fill(false);
			competents.forEach((competent, columnIdx) => {
				const isPrevStroked = currentRow[columnIdx - 1];
				if (columnIdx === 0 || isPrevStroked) return;

				if (Math.random() > strokePossibility) {
					currentRow[columnIdx] = true;
				}
			});
			strokes.push(currentRow);
		});

		// Swap each entries, to match rank
		strokes.forEach(row => {
			row.forEach((isStroked, columnIdx) => {
				if (isStroked) {
					[args[columnIdx - 1], args[columnIdx]] = [args[columnIdx], args[columnIdx - 1]];
				}
			});
		});

		// Draw ladder
		const canvas = createCanvas(args.length * gapPerEntry, imageY);
		const ctx = canvas.getContext('2d');

		ctx.font = `${fontSize}px NanumGothic`;
		ctx.fillStyle = COLOR.WHITE;
		ctx.strokeStyle = COLOR.WHITE;
		ctx.textAlign = 'center';

		competents.forEach((competent, idx) => {
			const posX = idx * gapPerEntry + gapPerEntry / 2;
			let name = competent.guild
				? competent.nickname
					? competent.nickname
					: competent.user.username
				: competent;
			const nameOversized = ctx.measureText(name).width > gapPerEntry - 2 * paddingX;

			if (nameOversized) {
				while(ctx.measureText(name).width > gapPerEntry - 2 * paddingX && name.length > 1) {
					name = name.substring(0, name.length - 1);
				}
			}

			// Competent name
			ctx.textBaseline = 'top';
			ctx.fillText(name, posX, 0);

			// Vertical line
			ctx.beginPath();
			ctx.lineTo(posX, strokeMinY - paddingY);
			ctx.lineTo(posX, strokeMaxY + paddingY);
			ctx.stroke();

			// Rank
			ctx.textBaseline = 'bottom';
			ctx.fillText(ranks[idx], posX, imageY);
		});

		// Horizontal line
		strokes.forEach((row, rowIdx) => {
			row.forEach((isStroked, columnIdx) => {
				if (isStroked) {
					const posX = columnIdx * gapPerEntry + gapPerEntry / 2;
					const strokeY = strokeMinY + rowIdx * gapPerStroke;

					ctx.beginPath();
					ctx.lineTo(posX - gapPerEntry, strokeY);
					ctx.lineTo(posX, strokeY);
					ctx.stroke();
				}
			});
		});

		const entryStr = args.map((arg, idx) => {
			return { arg: arg, rank: ranks[idx] };
		}).sort((a, b) => a.rank - b.rank)
			.map(entry => `${entry.rank <= 9 ? `${entry.rank}${EMOJI.KEYCAP}` : `${EMOJI.TEN}`} - ${entry.arg}`)
			.join('\n');

		channel.send(
			// Sort args in rank
			entryStr,
			{ files: [{ attachment: canvas.toBuffer() }] }
		);
	},
};
