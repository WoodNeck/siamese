import * as Scry from "scryfall-sdk";

export const searchCards = async (searchText: string) => {
  const cards = (await Scry.Cards.search(searchText, {
    include_multilingual: true
  }).cancelAfterPage().waitForAll()).slice(0, 10);

  return cards;
};
