import Command from "./Command";

/**
 * Command category
 */
class Category {
  public readonly name: string;
  public readonly description: string;
  public readonly categoryEmoji: string;
  public readonly commandEmoji: string;

  public readonly commands: Command[];

  public constructor({
    name,
    description,
    categoryEmoji,
    commandEmoji
  }: {
    name: string;
    description: string;
    categoryEmoji: string;
    commandEmoji: string;
  }) {
    this.name = name;
    this.description = description;
    this.categoryEmoji = categoryEmoji;
    this.commandEmoji = commandEmoji;
    this.commands = [];
  }

  public add(...command: Command[]) {
    this.commands.push(...command);
  }
}

export default Category;
