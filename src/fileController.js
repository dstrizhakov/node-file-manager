import { access, rename, rm as remove } from 'node:fs/promises';
import { createWriteStream, createReadStream } from 'node:fs';
import path from 'node:path';

import { prettyConsole } from "./console.js";

class FileController {
    cat(sourcePath) {
        return new Promise((resolve) => {
            createReadStream(sourcePath)
                .on('data', (chunk) => {
                    process.stdout.write(chunk);
                })
                .on('error', (error) => {
                    prettyConsole.error(error.message);
                    resolve();
                })
                .on("end", () => {
                    resolve();
                })
        })

    }

    async rn(pathToSourceFile, pathToRenamedFile) {

        try {
            await access(pathToRenamedFile);
            throw Error('Destination file is already exits');
        } catch (error) {
            if (error.code === 'ENOENT') {
                try {
                    await access(pathToSourceFile);
                    await rename(pathToSourceFile, pathToRenamedFile);
                } catch (error) {
                    prettyConsole.error('Source file is not found');
                }
            } else {
                prettyConsole.error(error.message)
            }
        }


    }

    async rm(sourcePath) {
        try {
            await remove(sourcePath);
        } catch {
            prettyConsole.error('File is not found');
        }
    }

    async cp(sourcePath, pathToDirectory) {
        const destinationPath = path.join(pathToDirectory, path.basename(sourcePath));
        try {
            await access(destinationPath);
            prettyConsole.error(`Destination file ${destinationPath} is already exits`)
        } catch (error) {
            if (error.code === 'ENOENT') {
                try {
                    await access(sourcePath);
                    const sourceStream = createReadStream(sourcePath)
                    const destinationStream = createWriteStream(destinationPath);
                    sourceStream.pipe(destinationStream);
                } catch (e) {
                    prettyConsole.error('Source file is not found');
                }
            } else {
                prettyConsole.error(error.message);
            }
        }
        // the simple way without streams
        // try {
        //     await cp(pathToSourceFile, pathToDestinationFile, {recursive: true, force: false, errorOnExist: true})
        // } catch (error) {
        //     console.log(error)
        // }
    }

    async mv(pathToFile, pathToDirectory) {
        await this.cp(pathToFile, pathToDirectory);
        await this.rm(pathToFile);
    }
}

const fileController = new FileController();

export default fileController;