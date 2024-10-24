import fs from "fs";
import { URLSearchParams } from "node:url";
import { ReadableStream } from "node:stream/web";
import vCard from "vcf";

function parseUrl(url, xAbLabel) {
  if (url === undefined) return {};

  if (xAbLabel !== undefined && xAbLabel.valueOf() === "Telegram") {
    return { telegram: url.replace(/^https:\/\/t.me\/@/, "") };
  }

  if (/instagram/.test(url)) {
    return { instagram: url.replace(/^https:\/\/www.instagram.com\//, "") };
  }

  if (/tumblr/.test(url)) {
    return { tumblr: url.replace(/^http:\/\//, "").replace(/^https:\/\//, "") };
  }

  if (/vk.ru/.test(url) || /vk.com/.test(url)) {
    return {
      vk: url
        .replace(/^http:\/\//, "")
        .replace(/^https:\/\//, "")
        .replace(/^vk.ru\//, "")
        .replace(/^vk.com\//, ""),
    };
  }

  return { url: url };
}

function parseCard({ data: card }) {
  const {
    adr,
    bday,
    email,
    fn,
    impp,
    n,
    note,
    org,
    photo,
    prodid,
    rev,
    tel,
    title,
    url,
    version,
    xAbLabel,
    xAbdate,
    xAbrelatednames,
  } = card;

  const namePartial = fn !== undefined ? { name: fn.valueOf() } : {};

  const phonePartial =
    tel !== undefined
      ? {
          phone: Array.isArray(tel.valueOf())
            ? tel.valueOf().map((phone) => phone.valueOf())
            : tel.valueOf(),
        }
      : {};

  const addressPartial = adr !== undefined ? { address: adr.valueOf() } : {};

  const birthPartial = bday !== undefined ? { birth: bday.valueOf() } : {};

  const emailPartial = email !== undefined ? { email: email.valueOf() } : {};

  const facebookPartial =
    impp !== undefined && impp.toJSON()[1].xServiceType === "Facebook"
      ? { facebook: impp.valueOf().replace(/^xmpp:/, "") }
      : {};

  const urlValue = url !== undefined ? url.valueOf() : undefined;

  const urls = Array.isArray(urlValue)
    ? urlValue.map((item) => item.valueOf())
    : [urlValue];

  const urlPartial = urls
    .map((item) => parseUrl(item, xAbLabel))
    .reduce((withPartial, partial) => {
      const key = Object.keys(partial)[0];

      const value =
        withPartial[key] !== undefined
          ? [withPartial[key], partial[key]].flat()
          : partial[key];

      return { ...withPartial, [key]: value };
    });

  const noteValue = note !== undefined ? note.valueOf() : undefined;

  const orgValue = org !== undefined ? org.valueOf() : undefined;

  const titleValue = title !== undefined ? title.valueOf() : undefined;

  const noteText = [noteValue, orgValue, titleValue].filter(Boolean).join(" ");

  const notePartial = noteText !== "" ? { note: noteText } : {};

  return {
    _: "person",
    person: crypto.randomUUID(),
    ...namePartial,
    ...phonePartial,
    ...addressPartial,
    ...birthPartial,
    ...emailPartial,
    ...facebookPartial,
    ...urlPartial,
    ...notePartial,
  };
}

export default async function parseVCF(sourcePath) {
  const index = await fs.promises.readFile(sourcePath);

  const cards = vCard.parse(index);

  const records = cards.map(parseCard);

  const toStream = ReadableStream.from(records);

  return toStream;
}
