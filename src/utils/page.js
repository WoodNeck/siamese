const dedent = require('@/utils/dedent');
const { RichEmbed } = require('discord.js');


class EmbedPage {
	constructor() {
		this._embed = new RichEmbed();
	}
	setTitle(title) {
		// Check null & undefined
		if (title && title.trim()) {
			this._embed.setTitle(title);
		}
		return this;
	}
	setDescription(desc) {
		if (desc && desc.trim()) {
			this._embed.setDescription(desc);
		}
		return this;
	}
	setFooter(footer, icon) {
		const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
		if (icon && !urlRegex.test(icon)) {
			icon = undefined;
		}

		// Can't set icon only, footer string is also needed
		if (footer && footer.trim()) {
			this._embed.setFooter(footer, icon);
		}
		return this;
	}
	setUrl(url) {
		const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;

		if (url && urlRegex.test(url)) {
			this._embed.setURL(url);
		}
		return this;
	}
	setImage(imageUrl) {
		const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;

		if (imageUrl && urlRegex.test(imageUrl)) {
			this._embed.setImage(imageUrl);
		}
		return this;
	}
	setThumbnail(thumb) {
		const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;

		if (thumb && urlRegex.test(thumb)) {
			this._embed.setThumbnail(thumb);
		}
		return this;
	}
	setColor(color) {
		this._embed.setColor(color);
		return this;
	}
	setData(data) {
		this._data = data;
		return this;
	}
	addField(title, description, inline) {
		this._embed.addField(title, description, inline);
		return this;
	}
	setAuthor(name, icon, url) {
		this._embed.setAuthor(name, icon, url);
		return this;
	}
	get isEmbed() { return true; }
	get content() { return this._embed; }
	get data() { return this._data; }
}

class StringPage {
	constructor() {
		this._msg = {
			title: null,
			desc: null,
			footer: null,
			color: null,
		};
	}
	setTitle(title) {
		if (title && title.trim()) {
			this._msg.title = title;
		}
		return this;
	}
	setDescription(desc) {
		if (desc && desc.trim()) {
			this._msg.desc = desc;
		}
		return this;
	}
	setFooter(footer) {
		if (footer && footer.trim()) {
			this._msg.footer = footer;
		}
		return this;
	}
	setImage() {
		// DO NOTHING
		return this;
	}
	setThumbnail() {
		// DO NOTHING
		return this;
	}
	setUrl() {
		// DO NOTHING
		return this;
	}
	setColor(color) {
		this._msg.color = color;
		return this;
	}
	setData(data) {
		this._data = data;
		return this;
	}
	get isEmbed() { return false; }
	get content() {
		return dedent`
			${this._msg.title ? this._msg.title : ''}
			${this._msg.desc ? this._msg.desc : ''}
			${this._msg.footer ? this._msg.footer : ''}
		`;
	}
	get data() { return this._data; }
}


module.exports = {
	EmbedPage: EmbedPage,
	StringPage: StringPage,
};
