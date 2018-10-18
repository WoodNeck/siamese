const fs = require('fs');
const path = require('path');

describe('Locale', () => {
	it('has all constants, in proper format', () => {
		const localeFiles = fs.readdirSync(path.join(__dirname, '../../src', 'locale'))
			.filter(file => file.endsWith('.js'));

		localeFiles.forEach(file => {
			const locale = require(`@/locale/${file}`);
			for (const category in locale) {
				expect(typeof(locale[category])).toBe('object');
				for (const constName in locale[category]) {
					const constant = locale[category][constName];
					expect(typeof(constant) === 'string' ||
						typeof(constant) === 'function').toBeTruthy();
				}
			}
		});
	});
});
