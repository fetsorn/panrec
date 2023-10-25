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

  const entry = {
    _: "datum",
    datum: content,
    actdate: date,
    category: "tg",
  };

  const nameOutcoming = "you";

  const senderID = fromID ?? actorID;

  const isOutcoming = senderID.replace(/^user/, "") === partnerID;

  if (isOutcoming) {
    entry.actname = nameOutcoming;
    entry.sayname = partnerName;
  } else {
    entry.sayname = nameOutcoming;
    entry.actname = partnerName;
  }

  const searchParams = new URLSearchParams(query);

  let matchesQuery = true;

  searchParams.forEach((value, key) => {
    matchesQuery = entry[key] === value;
  });

  if (matchesQuery) {
    return entry;
  }

  return undefined;
}

export default async function parseTG(sourcePath, query) {
  const indexPath = `${sourcePath}/result.json`;

  const index = JSON.parse(await fs.promises.readFile(indexPath));

  const { id: partnerID, name: partnerName, messages } = index;

  const entries = messages
    .map((message) => parseMessage(query, partnerID, partnerName, message))
    .filter(Boolean)
    .flat();

  const toStream = new stream.Readable({
    objectMode: true,

    read() {
      if (this.counter === undefined) {
        this.counter = 0;
      }

      this.push(entries[this.counter]);

      if (this.counter === entries.length - 1) {
        this.push(null);
      }

      this.counter += 1;
    },
  });

  return toStream;
}
