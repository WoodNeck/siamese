import chalk from "chalk";

import * as ERROR from "~/const/error";
import EnvVariables from "~/type/EnvVariables";

interface Validator {
  validate: (val: any) => boolean;
  error: string;
}

export const typetest = (target: Partial<EnvVariables>, checkList: {[key: string]: Validator}) => {
  for (const key in checkList) {
    if (!target[key]) {
      throw new Error(chalk.red(ERROR.ENV.VAR_MISSING(key)));
    }
    const val = target[key];
    const checker = checkList[key];
    if (!(checker.validate(val))) {
      throw new TypeError(chalk.red(`${checker.error} -> "${key}, given: ${val}"`));
    }
  }
};

export const validator = {
  notEmptyStr: {
    validate: (val: string) => Boolean(val && (val as string).trim() !== ""),
    error: ERROR.ENV.VAR_NO_EMPTY_STRING
  } as Validator,
  envStr: {
    validate: (val: string) => val === "development" || val === "production",
    error: ERROR.ENV.VAR_MUST_ENV
  } as Validator
};
