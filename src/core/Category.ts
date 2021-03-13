import Command from "./Command";

/**
 * Command category
 */
class Category {
  public readonly name: string;
  public readonly description: string;
  public readonly categoryEmoji: string;

  public readonly commands: Command[];

  public constructor(category: {
    NAME: string;
    DESC: string;
    EMOJI: string;
  }) {
    this.name = category.NAME;
    this.description = category.DESC;
    this.categoryEmoji = category.EMOJI;
    this.commands = [];
  }

  public add(...command: Command[]) {
    this.commands.push(...command);
  }
}

export default Category;
