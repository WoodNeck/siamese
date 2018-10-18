const dedent = require('@/utils/dedent');

describe('Dedent function', () => {
	it('can dedent single string', () => {
		expect(dedent('\t타타루\n타루')).toEqual('타타루\n타루');
	});

	it('can dedent multiline string properly', () => {
		expect(dedent`타타루
			타루
		`).toEqual('타타루\n타루');
		expect(dedent`
			타타루
			타루
		`).toEqual('타타루\n타루');
		expect(dedent`
			타타루
			타루`).toEqual('타타루\n타루');
	});

	it('can dedent arrow function returning templpate literal properly', () => {
		const testFunc = (val, val2) => dedent`
			${val}
			${val2}
		`
		expect(testFunc('타타루', '타루')).toEqual('타타루\n타루');
	});
});
