import { groupBy } from "@siamese/util";
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export interface SelectMenuOptions {
  id?: string;
  placeholder?: string;
  options?: StringSelectOption[];
}

export interface StringSelectOption {
  label: string;
  description: string;
  value: string;
  emoji?: string;
  default?: boolean;
}

class SelectMenu {
  public readonly id: SelectMenuOptions["id"];
  public readonly placeholder: SelectMenuOptions["placeholder"];
  public readonly options: NonNullable<SelectMenuOptions["options"]>;

  public constructor({
    id,
    placeholder,
    options = []
  }: SelectMenuOptions = {}) {
    this.id = id;
    this.placeholder = placeholder;
    this.options = options;
  }

  public addOption(options: StringSelectOption | StringSelectOption[]) {
    if (Array.isArray(options)) {
      this.options.push(...options);
    } else {
      this.options.push(options);
    }
  }

  public build(): Array<ActionRowBuilder<StringSelectMenuBuilder>> {
    if (this.options.length <= 0) {
      throw new Error("선택할 수 있는 옵션이 없는 상태로 빌드하려고 시도");
    }

    const groups = groupBy(this.options, 25);
    if (groups.length > 1 && this.id != null) {
      throw new Error("25개 이상의 옵션을 사용할 경우 ID를 지정할 수 없음");
    }

    return groups.map(group => {
      const builder = new StringSelectMenuBuilder();

      builder.setCustomId(this.id ?? crypto.randomUUID());

      if (this.placeholder) {
        builder.setPlaceholder(this.placeholder);
      }

      const options = group.map(option => {
        const optionBuilder = new StringSelectMenuOptionBuilder({
          label: option.label,
          description: option.description,
          value: option.value
        });

        if (option.emoji) {
          optionBuilder.setEmoji(option.emoji);
        }

        if (option.default) {
          optionBuilder.setDefault(true);
        }

        return optionBuilder;
      });

      builder.addOptions(options);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>();

      row.addComponents(builder);

      return row;
    });
  }
}

export default SelectMenu;
