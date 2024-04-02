import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { FuzzyMatcher } from "@siamese/fuzzy";
import { TRANSLATE_LANGS, translate } from "@siamese/google";

import { TRANSLATE } from "./const";

import type { AutocompleteContext } from "@siamese/core";

const LANG_LIST = Object.keys(TRANSLATE_LANGS);

class Translate extends Command {
  public override define() {
    return {
      data: TRANSLATE,
      preconditions: [
        new Cooldown(3)
      ]
    };
  }

  public override async execute({ sender, getParams }: CommandContext) {
    const [langCandidate, content] = getParams<typeof TRANSLATE.USAGE>();

    let targetLang = TRANSLATE_LANGS[TRANSLATE.DEFAULT_LANG];
    let translateContent = content;

    if (langCandidate != null) {
      const langCode = TRANSLATE_LANGS[langCandidate];
      if (langCode) {
        targetLang = langCode;
      } else {
        // 언어로 취급하지 않음
        translateContent = [langCandidate, content].join(" ");
      }
    }

    if (!translateContent || translateContent.length <= 0) {
      await sender.replyError(TRANSLATE.ERROR.NO_CONTENT);
      return;
    }

    const result = await translate(translateContent, {
      to: targetLang
    });

    const embed = new EmbedBuilder({
      description: `${EMOJI.MEMO} ${result.text}`,
      color: COLOR.BOT,
      footer: { text: TRANSLATE.FOOTER_FORMAT(translateContent) }
    });

    await sender.send(embed);
  }

  public async autocomplete({ content, respond }: AutocompleteContext): Promise<void> {
    const fuzzy = new FuzzyMatcher();
    const found = fuzzy.search(content, LANG_LIST);

    await respond(found.map(lang => ({ name: lang, value: lang })));
  }
}

export default Translate;
