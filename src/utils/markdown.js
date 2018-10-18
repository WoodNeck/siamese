const { Util } = require('discord.js');
const removeMd = require('remove-markdown');


module.exports = {
	strong: word => word ? `**${word.trim().replace(/^[*]{2,}|[*]{2,}$/gm, '')}**` : '',
	underline: word => word ? `__${word.trim().replace(/^[_]{2,}|[_]{2,}$/gm, '')}__` : '',
	italics: word => word ? `*${word.trim().replace(/^\*{1}[^*]*\*{1}$/gm, word.trim().slice(1, -1))}*` : '',
	strike: word => word ? `~~${word.trim().replace(/[~]{2}/gm, '')}~~` : '',
	code: word => word ? `\`${Util.escapeMarkdown(word.trim().replace(/^[`]{1,}|[`]{1,}$/gm, ''), false, true)}\`` : '',
	block: (word, lang = '') => word ?
		`\`\`\`${removeMd(lang.trim())}\n${removeMd(word.trim())}\`\`\`` : '',
};
