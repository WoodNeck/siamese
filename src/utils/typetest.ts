import chalk from "chalk";
import * as ERROR from "~/const/error";

interface Validator {
  validate: (val: any) => boolean;
  error: string;
}

export const typetest = (target: {[key: string]: string}, checkList: {[key: string]: Validator}) => {
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
    validate: (val: any) => Boolean(val && (val as string).trim() !== ""),
    error: ERROR.ENV.VAR_NO_EMPTY_STRING
  } as Validator
};
