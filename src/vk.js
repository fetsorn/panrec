import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import { parse } from 'parse5';
import { Iconv } from 'iconv';

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

  const name = a.childNodes[0].value

  return [path, name]
}

function parseMessage(item) {
      // console.log(item)
  const message = item.childNodes[1].childNodes.filter((a) => a.nodeName == 'div')[0]
      // console.log(message)

  // console.log(item)
  const dataId = message.attrs[1].value

  const content = message.childNodes[3].childNodes[0].value

  return [dataId, content]
}

export async function parseVK(sourcePath, query) {
  const searchParams = new URLSearchParams(query);

  const indexPath = `${sourcePath}/messages/index-messages.html`;

  const iconv = new Iconv('CP1251', 'UTF-8');

  const index = iconv.convert(await fs.promises.readFile(indexPath)).toString('utf8')

  const senders = parse(index).childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[1].childNodes[5].childNodes.filter((n) => n.nodeName == 'div')

  for (const sender of senders) {
    const [path, name] = parseSender(sender)

    const messages0Path = `${sourcePath}/messages/${path}`

    const messages0 = iconv.convert(await fs.promises.readFile(messages0Path)).toString('utf8')

    const messages = parse(messages0).childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[3].childNodes.filter((n) => n.nodeName == 'div' && n.attrs[0].value !== 'pagination clear_fix')

    for (const message of messages) {
      const [dataId, content] = parseMessage(message)

      console.log(name, dataId, content)
    }
  }

  const entries = []

  try {
    const toStream = new stream.Readable();

    for (const entry of entries) {
      toStream.push(JSON.stringify(entry, 2))
    }

    toStream.push(null);

    return toStream
  } catch(e) {
    console.log("vkStream", e)
  }
}
