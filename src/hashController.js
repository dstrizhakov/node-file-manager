import { createReadStream } from 'node:fs';
import * as crypto from 'node:crypto';
import { prettyConsole } from "./console.js";

class HashController {
    async hash(sourcePath) {
        await new Promise((resolve) => {
            const fileStream = createReadStream(sourcePath);
            const hash = crypto.createHash('sha256');
            fileStream
                .on('data', (data) => {
                    hash.update(data);
                })
                .on('end', () => {
                    prettyConsole.info(hash.digest('hex'))
                    resolve();
                })
                .on('error', () => {
                    prettyConsole.error(`Error reading file ${sourcePath}`)
                    resolve();
                })
        })
    }
}

const hashController = new HashController();

export default hashController;