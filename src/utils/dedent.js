// Dedent from string, useful for multiline string template
module.exports = (callSite, ...args) => {
	const format = str => {
		const strSplitted = str.split('\n');

		return strSplitted.map(substr => substr.trim())
			.filter(substr => substr.length > 0)
			.join('\n');
	};

	if (typeof callSite === 'string') {
		return format(callSite);
	}

	const output = callSite
		.slice(0, args.length + 1)
		.map((text, i) => (i === 0 ? '' : args[i - 1]) + text)
		.join('');

	return format(output);
};
