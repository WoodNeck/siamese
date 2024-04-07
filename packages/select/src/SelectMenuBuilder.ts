import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import SelectMenu from "./SelectMenu";

import type { SelectMenuOptions } from "./SelectMenu";

class SelectMenuBuilder {
  private _menus: Array<SelectMenu>;

  public constructor() {
    this._menus = [];
  }

  public build() {
    const menus = this._menus;

    if (menus.length <= 0) {
      throw new Error("빈 메뉴를 빌드하려고 시도");
    }

    const rows = menus.reduce((allRows, menu) => {
      return [...allRows, ...menu.build()];
    }, [] as ActionRowBuilder<StringSelectMenuBuilder>[]);

    return rows;
  }

  public addStringMenu(options: SelectMenuOptions = {}) {
    const menu = new SelectMenu(options);
    this._menus.push(menu);

    return menu;
  }
}

export default SelectMenuBuilder;
