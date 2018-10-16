const Tataru = require("@/tataru");


describe('Tataru', () => {
	it('can load all commands well', () => {
		const fs = require('fs');
		const path = require('path');
		const commandFiles = fs.readdirSync(path.join(__dirname, '../../src', 'commands'))
			.filter(file => file.endsWith('.js'));

		const tataru = new Tataru();
		tataru._loadCommands();
		expect(tataru.commands.size).toEqual(commandFiles.length);
	})
})
