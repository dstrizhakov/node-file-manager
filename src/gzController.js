import { createWriteStream, createReadStream } from 'node:fs';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { prettyConsole } from "./console.js";

class GzController {

    // here is destinationPath is - path to compressed file
    // it means the command should be like: compress file.txt archive.gz
    // https://discord.com/channels/755676888680366081/755676889212780622/1051549297340067840
    async compress(sourcePath, destinationPath) {
        const sourceStream = createReadStream(sourcePath);
        const destinationStream = createWriteStream(destinationPath);
        const brotliStream = createBrotliCompress();

        await new Promise((resolve) => {
            sourceStream
                .on('error', () => {
                    prettyConsole.error(`Error on read source file: ${sourcePath}`);
                    resolve();
                })
                .pipe(brotliStream)
                .on('error', () => {
                    prettyConsole.error(`Error on compressing file`);
                    resolve();
                })
                .pipe(destinationStream)
                .on('error', () => {
                    prettyConsole.error(`Error on save compressed file: ${destinationPath}`);
                    resolve();
                })
                .on('finish', () => {
                    prettyConsole.info(`File compressed and saved here: ${destinationPath}`);
                    resolve();
                });

        })
    }

    async decompress(sourcePath, destinationPath) {
        const sourceStream = createReadStream(sourcePath);
        const destinationStream = createWriteStream(destinationPath);
        const brotliStream = createBrotliDecompress();

        await new Promise((resolve) => {
            sourceStream
                .on('error', () => {
                    prettyConsole.error(`Error on read source file: ${sourcePath}`);
                    resolve();
                })
                .pipe(brotliStream)
                .on('error', () => {
                    prettyConsole.error(`Error on decompressing file`);
                    resolve();
                })
                .pipe(destinationStream)
                .on('error', () => {
                    prettyConsole.error(`Error on save decompressed file: ${destinationPath}`);
                    resolve();
                })
                .on('finish', () => {
                    prettyConsole.info(`File decompressed and saved here: ${destinationPath}`);
                    resolve();
                });

        })
    }
}

const gzController = new GzController();

export default gzController;