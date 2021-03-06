import { Express } from "express";

import Siamese from "~/Siamese";

export type Register = (ctx: {
  app: Express;
  bot: Siamese;
}) => void;
