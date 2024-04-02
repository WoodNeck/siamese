import { translate as googleTranslate } from "@vitalets/google-translate-api";

const translate = async (inputText: string, {
  from,
  to
}: {
  from?: string;
  to: string;
}) => {
  return await googleTranslate(inputText, { from, to });
};

export default translate;
