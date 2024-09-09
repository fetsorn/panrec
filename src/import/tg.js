import fs from "fs";
import stream from "stream";
import { URLSearchParams } from "node:url";

function parseMessage(query, partnerID, partnerName, message) {
  const {
    // id,
    type,
    date,
    // from,
    from_id: fromID,
    actor_id: actorID,
    text_entities: textEntities,
    duration_seconds: durationSeconds,
    discard_reason: discardReason,
  } = message;

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
    discardReason === "missed" ? "missed" : `${durationSeconds}s`;

  const phoneCall = type === "service" ? `☎️ ${duration}` : "";

  const content = text + phoneCall;

  const record = {
    _: "datum",
    datum: content,
    actdate: date,
    category: "tg",
  };

  const nameOutcoming = "you";

  const senderID = fromID ?? actorID;

  const isOutcoming = senderID.replace(/^user/, "") === partnerID;

  if (isOutcoming) {
    record.actname = nameOutcoming;
    record.sayname = partnerName;
  } else {
    record.sayname = nameOutcoming;
    record.actname = partnerName;
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

export default async function parseTG(sourcePath, query) {
  const indexPath = `${sourcePath}/result.json`;

  const index = JSON.parse(await fs.promises.readFile(indexPath));

  const { id: partnerID, name: partnerName, messages } = index;

  const records = messages
    .map((message) => parseMessage(query, partnerID, partnerName, message))
    .filter(Boolean)
    .flat();

  const toStream = stream.Readable.from(records);

  return toStream;
}
