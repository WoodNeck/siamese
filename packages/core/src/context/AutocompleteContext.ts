import { error } from "@siamese/log";

import type Bot from "../Bot";
import type Command from "../Command";
import type { AutocompleteInteraction } from "discord.js";

class AutocompleteContext {
  /**
   * 자기 자신을 리턴, 분해 할당을 통해 사용하기 편하도록
   */
  public get ctx() { return this; }

  public constructor(
    public readonly bot: Bot,
    public readonly command: Command,
    public readonly content: string,
    public readonly interaction: AutocompleteInteraction
  ) { }

  public respond = async (list: Array<{ name: string, value: string }>) => {
    try {
      await this.interaction.respond(list);
    } catch (err) {
      error(new Error(`자동완성 실패: ${err}`));
    }
  };
}

export default AutocompleteContext;
