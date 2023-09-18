import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { URLSearchParams } from 'node:url';
import { Iconv } from 'iconv';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import org from 'org-mode-parser';
export async function parseBiorg(sourcePath, query) {
  const index = await fs.promises.readFile(sourcePath);
  org.makelist(sourcePath, function (nl) {
    nl.forEach(el => {
      const datumValue = el.body.trim();
      el.properties.datum = datumValue;
      console.log(JSON.stringify(el.properties));
      console.log(el);
    });
  });

  try {
    const toStream = new stream.Readable({ objectMode: true });

    toStream.push(null);

    return toStream;
  } catch (e) {
    console.log('parseBiorg', e);
  }
}
