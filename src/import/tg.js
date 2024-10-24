import fs from "fs";
import { URLSearchParams } from "node:url";
import { ReadableStream } from "node:stream/web";

function parseMessage(query, friendID, friendName, message) {
  const {
    id: messageID,
    type,
    date,
    action,
    // from,
    from_id: fromID,
    actor_id: actorID,
    text_entities: textEntities,
    duration_seconds: durationSeconds,
    discard_reason: discardReason,
    file,
    media_type: mediaType,
  } = message;

  // const actionsWithoutSender = [
  //   "allow_sending_messages",
  //   "attach_menu_bot_allowed",
  //   "send_payment",
  // ];

  if (type === "service" && action !== "phone_call") return undefined;

  const text = textEntities
    .map((t) => {
      switch (t.type) {
        case "plain":
          return t.text;
        case "link":
          return t.text;
        default:
          return undefined;
      }
    })
    .join(" ");

  const duration =
    discardReason === "missed" ? "0:00:00" : `${durationSeconds}s`;

  const phoneCall =
    type === "service" && action === "phone_call" ? `☎️ ${duration}` : "";

  const attachment = file !== undefined ? `${mediaType} ${file}` : "";

  const content = text + phoneCall + attachment;

  const record = {
    _: "message",
    message: `tg_${friendID}_${messageID}`,
    datum1: content.replace(/\n/g, "\\n"),
    timestamp: date,
  };

  const personName = "fetsorn";

  const senderID = fromID ?? actorID;

  const isIncoming = senderID === `user${friendID}`;

  record.sender = isIncoming ? friendName : personName;
  record.reader = isIncoming ? personName : friendName;

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

export default async function parseTG(sourcePath, query) {
  const indexPath = `${sourcePath}/result.json`;

  const index = JSON.parse(await fs.promises.readFile(indexPath));

  const chats = index.id !== undefined ? [index] : index.chats.list;

  const records = chats
    .map(({ id: friendID, name: friendName, messages }) =>
      messages
        .map((message) =>
          parseMessage(
            query,
            friendID.toString(),
            `${friendName}_${friendID}`,
            message,
          ),
        )
        .filter(Boolean)
        .flat(),
    )
    .flat();

  const toStream = ReadableStream.from(records);

  return toStream;
}
