import * as Scry from "scryfall-sdk";

export const getRandomCard = async () => {
  return await Scry.Cards.random();
};
