const invalidStrings = Object.freeze([null, undefined, '', '   ', '\t', '\n']);
const invalidUrls = Object.freeze([
	'htt://www.google.com',
	'://www.google.com',
	'ftp://www.google.com'
]);

module.exports = {
	invalidStrings: invalidStrings,
	invalidUrls: invalidUrls,
};
