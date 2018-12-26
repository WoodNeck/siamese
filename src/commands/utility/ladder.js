const { createCanvas } = require('canvas');
const COLOR = require('@/constants/color');
const EMOJI = require('@/constants/emoji');
const ERROR = require('@/constants/error');
const PERMISSION = require('@/constants/permission');
const { LADDER } = require('@/constants/commands/utility');
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
		if (args.length < 2 || args.length > 10) {
			msg.error(ERROR.LADDER.COMPETERS_BETWEEN_2_10);
			return;
		}

		await channel.startTyping();

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

		// Draw ladder
		const gapPerEntry = 40;
		const imageY = 100;
		const fontSize = 15;
		const strokeMinY = 30;
		const strokeMaxY = 70;
		const gapPerStroke = 5;
		const strokePossibility = 0.5;
		const maxStrokes = (strokeMaxY - strokeMinY) / gapPerStroke + 1;
		const canvas = createCanvas(args.length * gapPerEntry, imageY);
		const ctx = canvas.getContext('2d');

		ctx.font = `${fontSize}px NanumGothic`;
		ctx.fillStyle = COLOR.WHITE;
		ctx.strokeStyle = COLOR.WHITE;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';

		// Horizontal strokes
		const strokes = [];
		competents.forEach((competent, idx) => {
			const posX = idx * gapPerEntry + gapPerEntry / 2;
			let name = competent.guild
				? competent.nickname
					? competent.nickname
					: competent.user.username
				: competent;
			name = name.length > 2
				? `${name.substr(0, 2)}..`
				: name;

			// Competent name
			ctx.fillText(name, posX, gapPerEntry / 2);

			// Vertical line
			ctx.beginPath();
			ctx.lineTo(posX, fontSize + 2 * gapPerStroke);
			ctx.lineTo(posX, 100 - (fontSize + 2 * gapPerStroke));
			ctx.stroke();

			// Rank
			ctx.fillText(ranks[idx], posX, imageY);

			// Horizontal lines
			strokes.push(Array(maxStrokes).fill(false));
			// Stroke from right to left
			if (!idx) return;
			const prevStrokes = strokes[idx - 1];
			for (let i = 0; i < maxStrokes; i += 1) {
				if (prevStrokes[i]) continue;
				if (Math.random() > strokePossibility) {
					const strokeY = strokeMinY + i * gapPerStroke;
					ctx.beginPath();
					ctx.lineTo(posX - gapPerEntry, strokeY);
					ctx.lineTo(posX, strokeY);
					ctx.stroke();

					strokes[idx][i] = true;
				}
			}
		});

		// Swap each entries, to match rank
		for (let i = 0; i < maxStrokes; i += 1) {
			strokes.forEach((stroke, idx) => {
				if (stroke[i]) {
					[args[idx - 1], args[idx]] = [args[idx], args[idx - 1]];
				}
			});
		}

		channel.send(
			// Sort args in rank
			args.map((arg, idx) => {
				return { arg: arg, rank: ranks[idx] };
			}).sort((a, b) => a.rank - b.rank)
				.map(entry => `${entry.rank <= 9 ? `${entry.rank}${EMOJI.KEYCAP}` : `${EMOJI.TEN}`} - ${entry.arg}`)
				.join('\n'),
			{ files: [{ attachment: canvas.toBuffer() }] }
		);
	},
};
