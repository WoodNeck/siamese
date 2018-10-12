module.exports = {
	strong: word => `**${word}**`,
	underline: word => `__${word}__`,
	italics: word => `*${word}*`,
	code: word => `\`${word}\``,
	block: (word, lang = '') => `\`\`\`${lang}\n${word}\`\`\``,
};
