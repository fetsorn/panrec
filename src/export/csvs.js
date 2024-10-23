import fs from "fs";
import csvs from "@fetsorn/csvs-js";

// async function addLFS({ fs: fsVirt, dir, filepath }) {
//   const fileBlob = await fsVirt.promises.readFile(path.join(dir, filepath));

//   const { buildPointerInfo, formatPointerInfo } = await import(
//     "@fetsorn/isogit-lfs"
//   );

//   const pointerInfo = await buildPointerInfo(fileBlob);

//   // turn blob into pointer
//   const pointerBlob = formatPointerInfo(pointerInfo);

//   const { writeBlob, updateIndex } = await import("isomorphic-git");

//   const pointerOID = await writeBlob({
//     fs: fsVirt,
//     dir,
//     blob: pointerBlob,
//   });

//   await updateIndex({
//     fs: fsVirt,
//     dir,
//     filepath,
//     oid: pointerOID,
//     add: true,
//   });
// }

export default async function writeCSVS(targetPath, doYank, doInsert) {
  // create .csvs.csv in targetPath if there is none
  try {
    await fs.promises.readFile(`${targetPath}/.csvs.csv`);
  } catch {
    await fs.promises.writeFile(`${targetPath}/.csvs.csv`, "csvs,0.0.2");
  }

  return doInsert
    ? csvs.insertRecordStream({ fs, dir: targetPath })
    : csvs.updateRecordStream({ fs, dir: targetPath });

  // TODO rewrite lfs to web stream or move to csvs-js
  // return new WritableStream({
  //   // eslint-disable-next-line no-unused-vars
  //   async write(entry, controller) {
  //     // TODO: check that entry is valid for csvs
  //     await updateRecord({ fs, dir: targetPath, query: entry });

  //     if (doYank) {
  //       if (entry.files.file[0]) {
  //         try {
  //           const { sourcepath, filename, filehash } = entry.files.file[0];

  //           const filepath = path.join("lfs", filehash);

  //           await fs.promises.copyFile(
  //             path.join(sourcepath, filename),
  //             path.join(targetPath, filepath),
  //           );

  //           await addLFS({
  //             fs,
  //             dir: targetPath,
  //             filepath,
  //           });
  //         } catch (e) {
  //           // do nothing
  //           // console.log(e)
  //         }
  //       }
  //     }
  //   },

  //   close() {},

  //   abort(err) {
  //     console.log("Sink error:", err);
  //   },
  // });
}
