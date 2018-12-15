module.exports = content => {
	const args = [];
	let lastIdx = 0;
	let idx = 0;

	while (idx < content.length) {
		const char = content[idx];

		if (char === ' ') {
			// Split args by blank space;
			// Exclude multiple blanks
			if (lastIdx !== idx) {
				args.push(content.substring(lastIdx, idx));
			}
			idx += 1;
			lastIdx = idx;
		}
		// Bundle args bound in double quotes
		// Exclude quotes only separated by blank space
		else if (char === '"' && lastIdx === idx) {
			const endIdx = content.indexOf('" ', idx + 1);
			if (endIdx > 0) {
				args.push(content.substring(idx + 1, endIdx));
				lastIdx = endIdx + 2;
				idx = lastIdx;
			}
			// Case of all remaining string is bound in double quote
			else if (content.endsWith('"')) {
				args.push(content.substring(idx + 1, content.length - 1));
				lastIdx = content.length;
				idx = lastIdx;
				break;
			}
			else {
				idx += 1;
			}
		}
		else {
			idx += 1;
		}
	}

	// Append last arg
	if (lastIdx < content.length) {
		args.push(content.substring(lastIdx, content.length));
	}

	// For blank arg, add double quotes for it as Discord won't accept blank message
	return args.map(arg => arg === ' ' ? `"${arg}"` : arg);
};
