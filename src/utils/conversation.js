const { DIALOGUE } = require('@/constants/type');


module.exports = class Conversation {
	constructor(msg) {
		this._msg = msg;
		this._dialogues = [];
	}

	add(content, checker) {
		this._dialogues.push({
			content: content,
			checker: checker,
		});
	}

	async start(maxTime) {
		const responses = [];
		let dialogue = this._dialogues.shift();
		while(dialogue) {
			await this._msg.channel.send(dialogue.content);

			const collector = this._msg.channel.createMessageCollector(
				msg => msg.author.id === this._msg.author.id,
				{ time: maxTime * 1000 }
			);
			const result = await new Promise(resolve => {
				collector.on('collect', msg => {
					// Check response is what we want
					dialogue.checker(msg, collector)
						? collector.stop(DIALOGUE.VALID)
						: collector.stop(DIALOGUE.INVALID);
				});
				collector.on('end', (collected, reason) => {
					resolve({
						collected: collected,
						reason: reason,
					});
				});
			});

			switch (result.reason) {
			case DIALOGUE.VALID:
				break;
			case DIALOGUE.INVALID:
				return {
					responses: responses,
					endReason: DIALOGUE.INVALID,
				};
			// Opponent not responded
			case DIALOGUE.NO_RESPONSE:
			default:
				return {
					responses: responses,
					endReason: DIALOGUE.NO_RESPONSE,
				};
			}

			responses.push(result.collected.first().content);
			dialogue = this._dialogues.shift();
		}
		return {
			responses: responses,
			endReason: DIALOGUE.VALID,
		};
	}
};
