import fs from 'fs';
import path from 'path';

export function buildBiorg(targetPath) {
	return new WritableStream({
		objectMode: true,

		async write(entry, encoding, next) {
			console.log(entry);
			console.log(`*.
				:PROPERTIES:
				:_: ${entry._}
				:UUID: ${entry.UUID}
				:DATUM: ${entry.datum}
				:ACT_DATE: ${entry.actdate}
				:SAY_DATE: ${entry.saydate}
				:CATEGORY: ${entry.category}
				:ACT_NAME: ${entry.actname}
				:SAY_NAME: ${entry.sayname}
				:END:
				* .`);
		},

		close() {},

		abort(err) {
			console.log('Sink error:', err);
		},
	});

	// return new WritableStream({
	//   objectMode: true,
	//   async write(entry, encoding, next) {
	//     await fs.promises.appendFile(targetPath, `* .\n${entry.datum}`)
	//   },
	//   close() {
	//   },
	//   abort(err) {
	//     console.log("Sink error:", err);
	//   },
	// });
}
