import {
  EmbedBuilder as DiscordEmbedBuilder,
  type ColorResolvable,
  type EmbedAuthorOptions,
  type EmbedFooterOptions,
  type APIEmbedField
} from "discord.js";
import validURL from "valid-url";

export interface EmbedOptions {
  title: string | null;
  description: string | null;
  color: ColorResolvable | null;
  author: EmbedAuthorOptions | null;
  footer: EmbedFooterOptions | null;
  image: string | null;
  thumbnail: string | null;
  timestamp: number | Date | null;
  url: string | null;
}

class EmbedBuilder {
  public title: EmbedOptions["title"];
  public description: EmbedOptions["description"];
  public color: EmbedOptions["color"];
  public author: EmbedOptions["author"];
  public footer: EmbedOptions["footer"];
  public image: EmbedOptions["image"];
  public thumbnail: EmbedOptions["thumbnail"];
  public timestamp: EmbedOptions["timestamp"];
  public url: EmbedOptions["url"];

  public fields: APIEmbedField[];

  private _builder: DiscordEmbedBuilder;

  public constructor({
    title = null,
    description = null,
    color = null,
    author = null,
    footer = null,
    image = null,
    thumbnail = null,
    timestamp = null,
    url = null
  }: Partial<EmbedOptions> = {}) {
    this._builder = new DiscordEmbedBuilder();

    this.title = title;
    this.description = description;
    this.color = color;
    this.author = author;
    this.footer = footer;
    this.image = image;
    this.thumbnail = thumbnail;
    this.timestamp = timestamp;
    this.url = url;

    this.fields = [];
  }

  public build() {
    const builder = this._builder;

    builder.setColor(this.color);
    builder.setTimestamp(this.timestamp);

    const fields = this.fields.slice(0, 25);
    fields.forEach(field => {
      const name = field.name.length > 256
        ? field.name.substring(0, 256)
        : field.name;
      const value = field.value.length > 1024
        ? field.value.substring(0, 1024)
        : field.value;

      builder.addFields({ name, value, inline: field.inline });
    });

    if (this.title) {
      if (this.title.length > 256) {
        builder.setTitle(this.title.substring(0, 256));
      } else {
        builder.setTitle(this.title);
      }
    }

    if (this.description) {
      if (this.description.length > 4096) {
        builder.setDescription(this.description.substring(0, 4096));
      } else {
        builder.setDescription(this.description);
      }
    }

    if (this.author && this.author.name !== "") {
      if (this.author.name.length > 256) {
        builder.setAuthor({
          ...this.author,
          name: this.author.name.substring(0, 256)
        });
      } else {
        builder.setAuthor(this.author);
      }
    }

    if (this.footer && this.footer.text !== "") {
      if (this.footer.text.length > 2048) {
        builder.setFooter({
          ...this.footer,
          text: this.footer.text.substring(0, 2048)
        });
      } else {
        builder.setFooter(this.footer);
      }
    }

    if (this.url && validURL.isWebUri(this.url)) {
      builder.setURL(this.url);
    }

    if (this.image && validURL.isWebUri(this.image)) {
      builder.setImage(this.image);
    }

    if (this.thumbnail && validURL.isWebUri(this.thumbnail)) {
      builder.setThumbnail(this.thumbnail);
    }

    return builder;
  }

  public setTitle(title: EmbedOptions["title"]): this {
    this.title = title;
    return this;
  }

  public setDescription(description: EmbedOptions["description"]): this {
    this.description = description;
    return this;
  }

  public setColor(color: EmbedOptions["color"]): this {
    this.color = color;
    return this;
  }

  public setAuthor(author: EmbedOptions["author"]): this {
    this.author = author;
    return this;
  }

  public setFooter(footer: EmbedOptions["footer"]): this {
    this.footer = footer;
    return this;
  }

  public setImage(image: EmbedOptions["image"]): this {
    this.image = image;
    return this;
  }

  public setThumbnail(thumbnail: EmbedOptions["thumbnail"]): this {
    this.thumbnail = thumbnail;
    return this;
  }

  public setTimestamp(timestamp: EmbedOptions["timestamp"]): this {
    this.timestamp = timestamp;
    return this;
  }

  public setURL(url: EmbedOptions["url"]): this {
    this.url = url;
    return this;
  }

  public addField(name: string, value: string, inline?: boolean): this {
    this.fields.push({
      name: name.substring(0, 256),
      value: value.substring(0, 1024),
      inline
    });
    return this;
  }
}

export default EmbedBuilder;
