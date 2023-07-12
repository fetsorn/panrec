import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import { parse } from 'parse5';
import { Iconv } from 'iconv';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

async function entry() {
  const index = await fs.promises.readFile(sourcePath, {encoding: 'utf8'})

  const wrap = parse(index).childNodes[1].childNodes[2].childNodes[1]

  // const header = wrap.childNodes.filter((a) => a.nodeName == 'div')[0]
  const menu = wrap.childNodes.filter((a) => a.nodeName == 'div')[1].childNodes.filter((a) => a.nodeName == 'div')[0]
  // const footer = wrap.childNodes.filter((a) => a.nodeName == 'div')[2]

  // four page blocs with item divs for each data category
  const pageBlocks = menu.childNodes.filter((a) => a.nodeName == 'div')
}

function parseSender(item) {
  const a = item.childNodes[1].childNodes[1].childNodes[1].childNodes[1]

  const path = a.attrs[0].value

  const id = path.slice(0, path.indexOf('/'))

  const name = a.childNodes[0].value

  return [id, name]
}

function parseMessage(item) {
  const message = item.childNodes[1].childNodes.filter((a) => a.nodeName == 'div')[0]

  const dataId = message.attrs[1].value

  const header = message.childNodes[1].childNodes.filter((a) => a.nodeName !== 'a')[0].value

  const isOutcoming = new RegExp("You, at").test(header)

  const dateString = header.slice(header.indexOf("at ") + 3)

  const date = dayjs(dateString, "hh-mm-ss a on D MMM YYYY")
        .format('YYYY-MM-DDTHH:mm:ss')

  const text = message.childNodes[3].childNodes[0].value

  const kludges = message.childNodes[3].childNodes.filter((a) => a.nodeName == 'div')[0]

  const attachments = kludges ? kludges.childNodes.filter((a) => a.nodeName == 'div').map((div) => {
    const description = div.childNodes.filter((a) => a.nodeName == 'div')[0].childNodes[0].value

    const link = div.childNodes.filter((a) => a.nodeName == 'a')[0]

    const href = link ? link.childNodes[0].value : ""

    return `${description}\n${href}\n`
  }).join('\n') : ""

  const content = `${text ?? ""}${attachments}`

  return {dataId, date, isOutcoming, content}
}

function messageEntry(query, name, message) {
  const { dataId, date, isOutcoming, content } = parseMessage(message)

  const entry = { _: "datum", datum: content, actdate: date, category: "vk" }

  const nameOutcoming = "you"

  if (isOutcoming) {
    entry.actname = nameOutcoming
    entry.sayname = name
  } else {
    entry.sayname = nameOutcoming
    entry.actname = name
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

async function messageFileEntries(query, name, messagesDir, messagesFile) {
  const messagesPath = `${messagesDir}/${messagesFile}`

  const messagesContents = await fs.promises.readFile(messagesPath)

  const iconv = new Iconv('CP1251', 'UTF-8');

  const messagesHTML = iconv.convert(messagesContents).toString('utf8')

  const messages = parse(messagesHTML).childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[3].childNodes.filter(
    (n) => n.nodeName == 'div' && n.attrs[0].value !== 'pagination clear_fix'
  )

  return messages.map((message) => messageEntry(query, name, message))
}

async function senderEntries(sourcePath, query, sender) {
  const [id, name] = parseSender(sender)

  const messagesDir = `${sourcePath}/messages/${id}`

  const messagesFiles = await fs.promises.readdir(messagesDir);

  const entries = await Promise.all(messagesFiles.filter((f) => f !== '.DS_Store').map(
    async (messagesFile) => messageFileEntries(query, name, messagesDir, messagesFile)
  ))

  return entries.flat()
}

export async function parseVK(sourcePath, query) {
  const searchParams = new URLSearchParams(query);

  const indexPath = `${sourcePath}/messages/index-messages.html`;

  const iconv = new Iconv('CP1251', 'UTF-8');

  const index = iconv.convert(await fs.promises.readFile(indexPath)).toString('utf8')

  const senders = parse(index).childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes.filter((n) => n.nodeName == 'div')

  const entries = await Promise.all(senders.map(
    async (sender) => senderEntries(sourcePath, query, sender)
  ))

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
