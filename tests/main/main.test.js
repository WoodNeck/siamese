const Tataru = require("@/tataru");


describe('Tataru', () => {
	it('has all env variables needed', () => {
		const tataru = new Tataru();

		expect(() => {
			tataru._loadEnvironment();
		}).not.toThrow();
	});
})
