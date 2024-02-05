import { createReadStream } from 'node:fs';
import * as crypto from 'node:crypto';
import path from 'node:path';
import { prettyConsole } from "./console.js";

class HashController {
    async hash(pathToFile, currentDirectory) {
        const sourcePath = this.getAbsolutePath(pathToFile, currentDirectory);
        return new Promise((resolve) => {
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
                .on('error', (error) => {
                    prettyConsole.error(`File ${sourcePath} not found`)
                    resolve();
                })
        })
    }
    getAbsolutePath(absoluteOrRelativePath, currentDirectory) {
        const isFilePathAbsolute = path.isAbsolute(absoluteOrRelativePath);
        return isFilePathAbsolute ? absoluteOrRelativePath : path.join(currentDirectory, absoluteOrRelativePath)
    }
}

const hashController = new HashController();

export default hashController;