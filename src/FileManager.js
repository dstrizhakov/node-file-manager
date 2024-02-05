import fs, { readdir, cp, access, rename, rm as remove } from 'node:fs/promises';
import { createWriteStream, createReadStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { prettyConsole } from "./console.js";
import { log } from 'node:console';

export class FileManager {
    constructor(cliController, osController, gzController, hashController, directory) {
        this.directory = directory;
        this.pathSeparator = path.sep;
        this.user = 'anonymous';
        this.cliController = cliController;
        this.osController = osController;
        this.gzController = gzController;
        this.hashController = hashController;
        this.start();
    }

    start() {
        process.argv.forEach((arg) => {
            if (arg.startsWith('--username'))
                this.user = arg.split('=')[1] || 'anonymous';
        })
        prettyConsole.info(`Welcome to the File Manager, ${this.user}!`)
        prettyConsole.info(`You are currently in ${this.directory}`)
        this.initCli();

    }

    initCli() {
        this.cliController
            .on('line', async (line) => {

                const command = line.toString().trim().split(' ')[0];
                const params = line.toString().trim().split(' ').slice(1);

                switch (command) {
                    case 'ls':
                        await this.ls();
                        prettyConsole.info(`You are currently in ${this.directory}`);
                        break;
                    case 'os':
                        this.osController.os(params[0]);
                        prettyConsole.info(`You are currently in ${this.directory}`);
                        break;
                    case 'up':
                        this.up();
                        prettyConsole.info(`You are currently in ${this.directory}`);
                        break;
                    case 'cd':
                        if (params[0]) {
                            await this.cd(params[0]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'add':
                        if (params[0]) {
                            await this.add(params[0]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'cat':
                        if (params[0]) {
                            await this.cat(params[0]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'rn':
                        if (params[0] && params[1]) {
                            await this.rn(params[0], params[1]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'rm':
                        if (params[0]) {
                            await this.rm(params[0]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'cp':
                        if (params[0] && params[1]) {
                            await this.cp(params[0], params[1]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'mv':
                        if (params[0] && params[1]) {
                            await this.mv(params[0], params[1]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'hash':
                        if (params[0]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            await this.hashController.hash(sourcePath)
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'compress':
                        if (params[0] && params[1]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            const destinationPath = this.getAbsolutePath(params[1])
                            await this.gzController.compress(sourcePath, destinationPath)
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'decompress':
                        if (params[0] && params[1]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            const destinationPath = this.getAbsolutePath(params[1])
                            await this.gzController.decompress(sourcePath, destinationPath)
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case '.exit':
                        this.exit();
                        break;
                    default:
                        if (command) {
                            prettyConsole.error(`Invalid input`)
                        }
                }

            })
            .on('SIGINT', () => {
                this.exit();
            })
    }

    exit() {
        prettyConsole.info(`Thank you for using File Manager, ${this.user}, goodbye!`)
        process.exit()
    }

    async ls() {
        try {
            const items = await readdir(this.directory, { withFileTypes: true });
            const listTable = [];
            for (let i = 0; i < items.length; i++) {
                listTable.push({ Name: items[i].name, Type: items[i].isDirectory() ? 'directory' : 'file' })
            }
            const dirListSorted = listTable.filter(item => item.Type === 'directory').sort((a, b) => a.Name.localeCompare(b.Name));
            const fileListSorted = listTable.filter(item => item.Type === 'file').sort((a, b) => a.Name.localeCompare(b.Name))
            console.table([...dirListSorted, ...fileListSorted]);
        } catch {
            prettyConsole.error(`Operation failed`)
        }
    }

    up() {
        let newPath;
        const pathParts = this.directory.split(this.pathSeparator);
        if (pathParts.length === 2) {
            newPath = pathParts[0] + this.pathSeparator;
        } else {
            pathParts.pop();
            newPath = pathParts.join(this.pathSeparator);
        }
        this.directory = newPath;
    }

    async cd(pathTo) {
        try {
            const isAbsolute = path.isAbsolute(pathTo)
            if (isAbsolute) {
                await readdir(pathTo);
                this.directory = pathTo;
            } else {
                const pathParts = this.directory.split(this.pathSeparator);
                pathParts.push(pathTo);
                const newPath = pathParts.join(this.pathSeparator);
                await readdir(newPath);
                this.directory = newPath;
            }
        } catch {
            prettyConsole.error('No such directory');
        }
    }

    async add(fileName) {
        const pathToNewFile = path.join(this.directory, fileName);

        // we can create new file using stream, but it's not required in this case
        // const writeStream = createWriteStream(pathToNewFile, 'utf8');
        // writeStream.on('error', (error) => {
        //     console.log(error);
        // })
        // writeStream.end();

        const content = ''; // empty content
        try {
            await fs.writeFile(pathToNewFile, content, { flag: 'wx' });
        } catch (error) {
            if (error.code === 'EEXIST') {
                prettyConsole.error('File is already exits')
            } else {
                prettyConsole.error(error.message)
            }
        }
    }

    cat(pathToFile) {
        const sourcePath = this.getAbsolutePath(pathToFile);
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
                    process.stdout.write(this.osController.eol);
                    resolve();
                })
        })

    }

    async rn(pathToFile, newName) {
        const isAbsolute = path.isAbsolute(pathToFile);
        let pathToSourceFile, pathToRenamedFile;
        if (isAbsolute) {
            pathToSourceFile = pathToFile;
            pathToRenamedFile = pathToSourceFile
                .split(this.pathSeparator).reverse()
                .slice(1).reverse()
                .join(this.pathSeparator) + this.pathSeparator + newName;
        } else {
            pathToSourceFile = path.join(this.directory, pathToFile);
            pathToRenamedFile = path.join(this.directory, newName);
        }

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

    async rm(pathToFile) {
        const sourcePath = this.getAbsolutePath(pathToFile);
        try {
            await remove(sourcePath);
        } catch {
            prettyConsole.error('File is not found');
        }
    }

    async cp(pathToFile, pathToDirectory) {
        const sourcePath = this.getAbsolutePath(pathToFile);
        const destinationPath = path.join(this.getAbsolutePath(pathToDirectory), path.basename(pathToFile));
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

    getAbsolutePath(absoluteOrRelativePath) {
        const isFilePathAbsolute = path.isAbsolute(absoluteOrRelativePath);
        return isFilePathAbsolute ? absoluteOrRelativePath : path.join(this.directory, absoluteOrRelativePath)
    }

}
