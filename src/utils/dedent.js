// Dedent from string, useful for multiline string template
const dedent = (callSite, ...args) => {
	const format = str => {
		const strSplitted = str.split('\n');

		return strSplitted.filter(substr => substr.length > 0)
			.map(substr => substr.trim())
			.join('\n');
	};

	if (typeof callSite === 'string') {
		return format(callSite);
	}
	else if (typeof callSite === 'function') {
		return (...arg) => format(callSite(...arg));
	}

	const output = callSite
		.slice(0, args.length + 1)
		.map((text, i) => (i === 0 ? '' : args[i - 1]) + text)
		.join('');

	return format(output);
};

module.exports = dedent;
