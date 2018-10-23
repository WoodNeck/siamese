const Tataru = require('@/tataru');
const Invite = require('@/commands/utility/invite')(global.env.BOT_DEFAULT_LANG);


describe('Command: Invite', () => {
	it('will send invite message', async () => {
		global.botMock.generateInvite = () => {
			return new Promise((resolve, reject) => {
				resolve('타타루_링크');
			});
		};

		await Invite.execute(global.cmdObjMock);
		expect(global.cmdObjMock.channel.sendMock).toBeCalled();
	});
})
