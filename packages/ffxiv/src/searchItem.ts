import { COLOR } from "@siamese/color";
import { EMOJI } from "@siamese/emoji";
import { block } from "@siamese/markdown";
import { range, toValidURL } from "@siamese/util";
import axios from "axios";
import { load, type Cheerio, type Element as CheerioEl, type CheerioAPI } from "cheerio";

import { ENTRIES_ENDPOINT, ITEM_COLOR, ITEM_ENDPOINT } from "./const";

import type { ItemEntry } from "./types";

export const searchItemEntries = async (searchText: string): Promise<ItemEntry[]> => {
  const entriesRes = await axios.get(ENTRIES_ENDPOINT, {
    params: {
      keyword: searchText
    }
  });

  if (entriesRes.status !== 200 || !entriesRes.data) {
    return [];
  }

  const entriesPage = load(entriesRes.data);
  const items = entriesPage(".base_tb").find("tr").toArray().slice(1);

  if (!items.length) {
    return [];
  }

  return items.map(item => {
    const itemTR = entriesPage(item);
    const anchor = itemTR.find("a");
    const iconURL = itemTR.find("img").attr("src")!;

    const itemName = anchor.text();
    const itemClass = anchor.attr("class")?.trim();
    const itemColor = (itemClass && itemClass in ITEM_COLOR)
      ? ITEM_COLOR[itemClass]
      : COLOR.BLACK;
    const itemURL = itemTR.find("a").attr("href")!;

    return {
      name: itemName,
      color: itemColor,
      icon: toValidURL(iconURL),
      url: itemURL
    };
  });
};

export const searchItem = async (subURL: string) => {
  const itemURL = ITEM_ENDPOINT(subURL);
  const res = await axios.get(itemURL);

  if (res.status !== 200 || !res.data) {
    return null;
  }

  const $ = load(res.data);
  const itemInfoWrapper = $(".cont_in.cont_view");
  const iconURL = toValidURL(itemInfoWrapper.find(".view_icon img").attr("src")!);
  const nameWrapper = itemInfoWrapper.find(".view_name");
  const name = nameWrapper.find("h1").text();
  const itemClass = nameWrapper.find("h1").attr("class")?.split(" ").find(val => /^col/.test(val));
  const itemColor = (itemClass && itemClass in ITEM_COLOR)
    ? ITEM_COLOR[itemClass]
    : COLOR.BLACK;
  const itemType = `*${nameWrapper.find("p").text()}*`;
  const viewBase = itemInfoWrapper.find(".view_base:not([name])");
  const itemStat = itemInfoWrapper.find(".item_stat");
  const itemCondition = `${itemInfoWrapper.find(".item_condition").text().split("\n").map(val => val.trim()).filter(val => !!val).join(" / ")}`;
  const itemDesc = viewBase.first().text();
  const hasHQ = itemInfoWrapper.find(".hq_icon").length > 0;
  const viewBases = viewBase.slice(1).toArray();

  return {
    name,
    type: itemType,
    description: itemDesc,
    condition: itemCondition,
    url: itemURL,
    icon: iconURL,
    color: itemColor,
    hasHQ,
    stats: getItemStat(itemStat),
    additional: getItemAdditional(itemInfoWrapper),
    viewbase: getViewBase(viewBases, $)
  };
};

const getItemStat = (itemStat: Cheerio<CheerioEl>) => {
  if (!itemStat.length) return;

  const hq = itemStat.find("ul[name=\"hq\"]");
  const nq = itemStat.find("ul[name=\"nq\"]");

  if (!hq.length && !nq.length) return;

  try {
    const categories = nq.find(".st_kind").toArray().reverse();
    const nqValues = nq.find(".st_value").toArray().reverse();
    const hqValues = hq.find(".st_value").toArray().reverse();

    return categories.map((category, idx) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const categoryName = (category.firstChild as any)?.data;
      const nqValue = (nqValues[idx].firstChild as any)?.data;
      const hqValue = (hqValues[idx]?.firstChild as any)?.data;
      /* eslint-enable @typescript-eslint/no-explicit-any */

      return {
        name: categoryName,
        value: hqValue ? `${nqValue}(${hqValue}\\*)` : `${nqValue}`
      };
    });
  } catch (err) { } // eslint-disable-line no-empty
};

const getItemAdditional = (wrapper: Cheerio<CheerioEl>) => {
  const nqProp = wrapper.find(".view_base[name=\"nq\"]");
  const hqProp = wrapper.find(".view_base[name=\"hq\"]");

  if (!nqProp.length && !hqProp.length) return;

  try {
    const title = nqProp.find("h2").text();
    const nqProps = nqProp.find("p").toArray()
      .map(el => (el.firstChild! as any).data); // eslint-disable-line @typescript-eslint/no-explicit-any
    const hqProps = hqProp.find("p").toArray()
      .map(el => (el.firstChild! as any).data) // eslint-disable-line @typescript-eslint/no-explicit-any
      .map(text => /\d+/.exec(text)![0]);

    const props = hqProps.length
      ? nqProps.map((prop, idx) => `${prop}(${hqProps[idx]}*)`)
      : nqProps;

    const desc = range(Math.ceil(props.length / 2))
      .map(idx => props.slice(idx * 2, idx * 2 + 2).join(" ")).join("\n");

    return {
      title,
      description: block(desc, "js")
    };
  } catch (err) { } // eslint-disable-line no-empty
};

const getViewBase = (elements: CheerioEl[], $: CheerioAPI) => {
  return elements
    .map(element => $(element))
    .map(element => {
      const title = element.find("h2").text().trim() || EMOJI.ZERO_WIDTH_SPACE;
      const materiaEls = element.find(".materia");

      try {
        if (materiaEls.length) {
          return {
            title,
            description: EMOJI.CIRCLE.HOLLOW.repeat(materiaEls.length)
          };
        } else {
          const p = element.find("p:not([name])").toArray();

          const halfTable = p.filter(el => el.attribs["class"]?.includes("second_col")).map(el => $(el).text());
          const list = p.filter(el => el.attribs["class"]?.includes("third_col")).map(el => $(el).text());

          const tableContents = range(Math.ceil(halfTable.length / 2)).map(idx => halfTable.slice(idx * 2, idx * 2 + 2).join(" - ")).map(text => `${EMOJI.MIDDLE_DOT} ${text}`).join("\n");
          const listContents = range(Math.ceil(list.length / 3)).map(idx => list.slice(idx * 3, idx * 3 + 3).join(" / ")).join("\n");

          const desc = `${tableContents}\n${listContents}`.trim();

          if (!title || !desc) return;

          return {
            title,
            description: desc
          };
        }
      } catch (err) { } // eslint-disable-line no-empty
    })
    .filter(val => !!val) as Array<{ title: string, description: string }>;
};
