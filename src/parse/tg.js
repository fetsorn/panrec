import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';

function parseMessage(query, partnerID, partnerName, message) {

  const { id, type, date, from, from_id: fromID, actor_id: actorID, text_entities: textEntities, duration_seconds: durationSeconds, discard_reason: discardReason } = message

  const text = textEntities.map((t) => {
    switch (t.type) {
      case "plain":
        return t.text
      case "link":
        return t.text
    }
  }).join(' ')

  const duration = discardReason === "missed" ? "missed" : `${durationSeconds}s`

  const phone_call = type === "service" ? `☎️ ${duration}` : ""

  const content = text + phone_call

  const entry = { _: "datum", datum: content, actdate: date, category: "tg" }

  const nameOutcoming = "you"

  const senderID = fromID ?? actorID;

  const isOutcoming = senderID.replace(/^user/, '') == partnerID

  if (isOutcoming) {
    entry.actname = nameOutcoming
    entry.sayname = partnerName
  } else {
    entry.sayname = nameOutcoming
    entry.actname = partnerName
  }

  const searchParams = new URLSearchParams(query);

  let matchesQuery = true;

  for (const [key, value] of searchParams.entries()) {
    matchesQuery = entry[key] == value
  }

  if (matchesQuery) {
    return entry
  }
}

export async function parseTG(sourcePath, query) {
  const searchParams = new URLSearchParams(query);

  const indexPath = `${sourcePath}/result.json`;

  const index = JSON.parse(await fs.promises.readFile(indexPath))

  const { id: partnerID, name: partnerName, messages } = index

  const entries = messages.map((message) => parseMessage(query, partnerID, partnerName, message)).filter(Boolean)

  try {
    const toStream = new stream.Readable({objectMode: true});

    for (const entry of entries.flat()) {
      toStream.push(JSON.stringify(entry, 2))
    }

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("vkStream", e)
  }
}
