import Command from "./Command";

/**
 * Command category
 */
class Category {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly categoryEmoji: string;

  public readonly commands: Command[];

  public constructor(category: {
    ID: string;
    NAME: string;
    DESC: string;
    EMOJI: string;
  }) {
    this.id = category.ID;
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
