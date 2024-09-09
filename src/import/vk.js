import fs from "fs";
import path from "path";
import stream from "stream";
import { URLSearchParams } from "node:url";
import { parse } from "parse5";
import { Iconv } from "iconv";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

function isBody(item) {
  return item.nodeName === "body";
}

function isText(item) {
  return item.nodeName === "#text";
}

function isDiv(item) {
  return item.nodeName === "div";
}

function isA(item) {
  return item.nodeName === "a";
}

function buildRecord(query, name, date, isOutcoming, content) {
  const record = {
    _: "datum",
    datum: content,
    actdate: date,
    category: "vk",
  };

  const nameOutcoming = "you";

  if (isOutcoming) {
    record.actname = nameOutcoming;
    record.sayname = name;
  } else {
    record.sayname = nameOutcoming;
    record.actname = name;
  }

  const searchParams = new URLSearchParams(query);

  let matchesQuery = true;

  searchParams.forEach((value, key) => {
    matchesQuery = record[key] === value;
  });

  if (matchesQuery) {
    return record;
  }

  return undefined;
}

function parseAttachments(kludges) {
  const attachments = kludges.childNodes.filter(isDiv);

  const descriptions = attachments.map((attachment) => {
    const [attachmentDescription] = attachment.childNodes.filter(isDiv);

    const [descriptionContent] =
      attachmentDescription.childNodes.filter(isText);

    const description = descriptionContent.value;

    const [a] = attachment.childNodes.filter(isA);

    const [label] = a ? a.childNodes : [];

    const link = label ? label.value : "";

    return `${description}\n${link}\n`;
  });

  return descriptions.join("\n");
}

function parseMessage(item) {
  const [itemMain] = item.childNodes.filter(isDiv);

  const [message] = itemMain.childNodes.filter(isDiv);

  // data-id="1234"
  const [className, dataId] = message.attrs;

  // 1234
  const messageId = dataId.value;

  const [header, messageBody] = message.childNodes.filter(isDiv);

  const [headerContent] = header.childNodes.filter(isText);

  const headerText = headerContent.value;

  const isOutcoming = /You, at/.test(headerText);

  const dateString = headerText.slice(headerText.indexOf("at ") + 3);

  const date = dayjs(dateString, "hh-mm-ss a on D MMM YYYY").format(
    "YYYY-MM-DDTHH:mm:ss",
  );

  const [messageContent] = messageBody.childNodes.filter(isText);

  const messageText = messageContent ? messageContent.value : "";

  const [kludges] = messageBody.childNodes.filter(isDiv);

  const attachments = kludges ? parseAttachments(kludges) : "";

  const content = `${messageText}${attachments}`;

  return { date, isOutcoming, content };
}

async function parseMessageFile(query, name, messageFile) {
  const iconv = new Iconv("CP1251", "UTF-8");

  const messageContents = iconv
    .convert(await fs.promises.readFile(messageFile))
    .toString("utf8");

  const document = parse(messageContents);

  const [documentType, html] = document.childNodes;

  const [body] = html.childNodes.filter(isBody);

  const [wrap] = body.childNodes.filter(isDiv);

  const [header, pageContent] = wrap.childNodes.filter(isDiv);

  const [wrapPageContent] = pageContent.childNodes.filter(isDiv);

  const items = wrapPageContent.childNodes
    .filter(isDiv)
    .filter((item) => item.attrs[0].value !== "pagination clear_fix");

  return items.map(parseMessage);

  return [];
}

async function parseMessages(sourcePath, query, id, name) {
  const messageDir = path.join(sourcePath, "messages", id);

  const messageFiles = await fs.promises.readdir(messageDir);

  const messages = await Promise.all(
    messageFiles
      .filter((f) => f !== ".DS_Store")
      .map(async (messageFile) =>
        parseMessageFile(query, name, path.join(messageDir, messageFile)),
      ),
  );

  const records = messages
    .flat()
    .map(({ date, isOutcoming, content }) =>
      buildRecord(query, name, date, isOutcoming, content),
    );

  return records;
}

function parseSender(item) {
  const [itemMain] = item.childNodes.filter(isDiv);

  const [messagePeer] = itemMain.childNodes.filter(isDiv);

  const [messagePeerId] = messagePeer.childNodes.filter(isDiv);

  const [a] = messagePeerId.childNodes.filter(isA);

  const [label] = a.childNodes;

  // <a href="">name</a>
  const name = label.value;

  const [href] = a.attrs;

  // <a href="link"></a>
  const link = href.value;

  // 1/messages0.html -> 1
  const id = link.slice(0, link.indexOf("/"));

  return { id, name };
}

export default async function parseVK(sourcePath, query) {
  const indexPath = path.join(sourcePath, "messages", "index-messages.html");

  const iconv = new Iconv("CP1251", "UTF-8");

  const index = iconv
    .convert(await fs.promises.readFile(indexPath))
    .toString("utf8");

  const document = parse(index);

  const [documentType, html] = document.childNodes;

  const [body] = html.childNodes.filter(isBody);

  const [wrap] = body.childNodes.filter(isDiv);

  const [header, pageContent, footer] = wrap.childNodes.filter(isDiv);

  const [pageBlock] = pageContent.childNodes.filter(isDiv);

  const [wrapPageContent] = pageBlock.childNodes.filter(isDiv);

  const items = wrapPageContent.childNodes.filter(isDiv);

  const senders = items.map(parseSender);

  const records = await Promise.all(
    senders.map(async ({ id, name }) =>
      parseMessages(sourcePath, query, id, name),
    ),
  );

  const toStream = stream.Readable.from(records.flat());

  return toStream;
}
