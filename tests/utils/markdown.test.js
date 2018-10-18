const { strong, underline, italics, strike, code, block } = require('@/utils/markdown');


describe('MarkDown', () => {
	const testTexts = [
		'', 'abc', '타타루', ' abc ', '*타타루*', '_타타루_', '**타타루**', '__타타루__', '`타타루`'
	];

	it('returns proper strong string', () => {
		const expected = [
			'', '**abc**', '**타타루**', '**abc**', '***타타루***', '**_타타루_**', '**타타루**', '**__타타루__**', '**`타타루`**'
		];

		testTexts.forEach((text, idx) => {
			const formatted = strong(text);
			expect(formatted).toEqual(expected[idx]);
		});
	});

	it('returns proper underline string', () => {
		const expected = [
			'', '__abc__', '__타타루__', '__abc__', '__*타타루*__', '___타타루___', '__**타타루**__', '__타타루__', '__`타타루`__'
		];

		testTexts.forEach((text, idx) => {
			const formatted = underline(text);
			expect(formatted).toEqual(expected[idx]);
		});
	});

	it('returns proper italics string', () => {
		const expected = [
			'', '*abc*', '*타타루*', '*abc*', '*타타루*', '*_타타루_*', '***타타루***', '*__타타루__*', '*`타타루`*'
		];

		testTexts.forEach((text, idx) => {
			const formatted = italics(text);
			expect(formatted).toEqual(expected[idx]);
		});
	});

	it('returns proper strike string', () => {
		const expected = [
			'', '~~abc~~', '~~타타루~~', '~~abc~~', '~~*타타루*~~', '~~_타타루_~~', '~~**타타루**~~', '~~__타타루__~~', '~~`타타루`~~'
		];

		testTexts.forEach((text, idx) => {
			const formatted = strike(text);
			expect(formatted).toEqual(expected[idx]);
		});
	});

	it('returns proper code string', () => {
		const expected = [
			'', '`abc`', '`타타루`', '`abc`', '`*타타루*`', '`_타타루_`', '`**타타루**`', '`__타타루__`', '`타타루`'
		];

		testTexts.forEach((text, idx) => {
			const formatted = code(text);
			expect(formatted).toEqual(expected[idx]);
		});
	});

	it('returns proper block string', () => {
		const langs = [
			'', undefined, 'py', 'cs', '**c**', '__cpp__', '~~java~~', '*sh*', '```js```'
		]
		const expected = [
			'', '```\nabc```', '```py\n타타루```', '```cs\nabc```', '```c\n타타루```', '```cpp\n타타루```', '```java\n타타루```', '```sh\n타타루```', '```js\n타타루```'
		];

		testTexts.forEach((text, idx) => {
			const formatted = block(text, langs[idx]);
			expect(formatted).toEqual(expected[idx]);
		});
	});
});
