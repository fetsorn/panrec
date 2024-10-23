import { ReadableStream, TransformStream } from "node:stream/web";
import fs from "fs";
import path from "path";
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

function buildRecord(
  query,
  userId,
  name,
  date,
  isOutcoming,
  messageId,
  content,
) {
  const record = {
    _: "message",
    message: `${userId}_${messageId}`,
    datum: content,
    timestamp: date,
  };

  const subject = "you";
  const contact = `${name}_${userId}`;

  if (isOutcoming) {
    record.sender = subject;
    record.reader = contact;
  } else {
    record.sender = contact;
    record.reader = subject;
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

  return { date, isOutcoming, content, messageId };
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
}

async function parseMessages(sourcePath, query, userId, name) {
  const messageDir = path.join(sourcePath, "messages", userId);

  const messageFiles = await fs.promises.readdir(messageDir);

  const messageStream = ReadableStream.from(
    messageFiles.filter((f) => f !== ".DS_Store"),
  );

  const parseStream = new TransformStream({
    async transform(messageFile, controller) {
      const messages = await parseMessageFile(
        query,
        name,
        path.join(messageDir, messageFile),
      );

      messages.forEach((record) => controller.enqueue(record));
    },
  });

  const messages = [];

  const collectStream = new WritableStream({
    write(message) {
      messages.push(message);
    },
  });

  await messageStream.pipeThrough(parseStream).pipeTo(collectStream);

  const records = messages
    .flat()
    .map(({ date, isOutcoming, content, messageId }) =>
      buildRecord(query, userId, name, date, isOutcoming, messageId, content),
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
  const userId = link.slice(0, link.indexOf("/"));

  return { userId, name };
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

  const senderStream = ReadableStream.from(senders);

  const parseStream = new TransformStream({
    async transform(sender, controller) {
      const { userId, name } = sender;

      const records = await parseMessages(sourcePath, query, userId, name);

      records.forEach((record) => controller.enqueue(record));
    },
  });

  return senderStream.pipeThrough(parseStream);
}
