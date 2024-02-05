import { createWriteStream, createReadStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { createGzip, createUnzip } from 'node:zlib';
import path from 'node:path';
import { prettyConsole } from "./console.js";

class GzController {
    async compress(pathToFile, pathToDestination, currentDirectory) {
        const sourcePath = this.getAbsolutePath(pathToFile, currentDirectory);
        const destinationPath = this.getAbsolutePath(pathToDestination, currentDirectory)
        const gzip = createGzip();
        const sourceStream = createReadStream(sourcePath);
        const destinationStream = createWriteStream(destinationPath);
        return new Promise((resolve) => {
            pipeline(sourceStream, gzip, destinationStream, (error) => {
                if (error) {
                    prettyConsole.error('Compress process failed' + ' ' + error);
                }
                resolve();
            })
        })
    }

    async decompress(pathToFile, pathToDestination, currentDirectory) {
        const sourcePath = this.getAbsolutePath(pathToFile, currentDirectory);
        const destinationPath = this.getAbsolutePath(pathToDestination, currentDirectory)
        const unzip = createUnzip();
        const source = createReadStream(sourcePath);
        const destination = createWriteStream(destinationPath);
        await new Promise((resolve) => {
            pipeline(source, unzip, destination, (error) => {
                if (error) {
                    prettyConsole.error('Compress process failed' + ' ' + error);
                }
                resolve();
            })
        })
    }

    getAbsolutePath(absoluteOrRelativePath, currentDirectory) {
        const isFilePathAbsolute = path.isAbsolute(absoluteOrRelativePath);
        return isFilePathAbsolute ? absoluteOrRelativePath : path.join(currentDirectory, absoluteOrRelativePath)
    }
}

const gzController = new GzController();

export default gzController;