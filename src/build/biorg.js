import fs from 'fs';
import path from 'path';

export function buildBiorg(targetPath) {
	return new WritableStream({
		objectMode: true,

		async write(entry, encoding, next) {
			console.log(`* .`);
			console.log(`:PROPERTIES:`);
			Object.keys(entry)
				.filter(key => key != 'datum')
				.forEach(key => {
					console.log(`:${key}:`, entry[key]);
				});
			console.log(`:END:`);
			console.log(entry.datum);
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
