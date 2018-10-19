const Tataru = require("@/tataru");
const Invite = require("@/commands/utils/invite")(global.env.BOT_DEFAULT_LANG);


describe('Command: Invite', () => {
	it('will send invite message', async () => {
		const tataru = new Tataru();
		tataru.user = new Object();
		tataru.generateInvite = () => {
			return new Promise((resolve, reject) => {
				resolve('타타루_링크');
			});
		};

		const sendMock = jest.fn();
		const channel = {
			send: sendMock
		};

		await Invite.execute({
			bot: tataru,
			channel: channel
		});
		expect(sendMock).toBeCalled();
	});
})
