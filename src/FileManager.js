import fs, {readdir, cp, access, rename, rm as remove} from 'node:fs/promises';
import {createWriteStream, createReadStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import * as crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {prettyConsole} from "./console.js";

export class FileManager {
    constructor(cli, directory) {
        this.directory = directory;
        this.pathSeparator = path.sep;
        this.user = 'anonymous';
        this.cli = cli;
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
        this.cli
            .on('line', async (line) => {

                const command = line.toString().trim().split(' ')[0];
                const params = line.toString().trim().split(' ').slice(1);

                switch (command) {
                    case 'ls':
                        await this.ls();
                        prettyConsole.info(`You are currently in ${this.directory}`);
                        break;
                    case 'os':
                        this.os(params[0]);
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
                           await this.hash(params[0]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'compress':
                        if (params[0] && params[1]) {
                            await this.compress(params[0], params[1]);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'decompress':
                        if (params[0] && params[1]) {
                            await this.decompress(params[0], params[1]);
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
            const items = await readdir(this.directory, {withFileTypes: true});
            const listTable = [];
            for (let i = 0; i < items.length; i++) {
                listTable.push({Name: items[i].name, Type: items[i].isDirectory() ? 'directory' : 'file'})
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
                const pathParts = this.directory.split(this.pathSeparator).filter(part => part !== '');
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
            await fs.writeFile(pathToNewFile, content, {flag: 'wx'});
        } catch (error) {
            if (error.code === 'EEXIST') {
                prettyConsole.error('File is already exits')
            } else {
                prettyConsole.error(error.message)
            }
        }
    }

    cat(pathToFile) {
        const isAbsolute = path.isAbsolute(pathToFile);
        let pathToSourceFile;
        if (isAbsolute) {
            pathToSourceFile = pathToFile;
        } else {
            pathToSourceFile = path.join(this.directory, pathToFile);
        }
        return new Promise((resolve, reject) => {
            createReadStream(pathToSourceFile)
                .on('data', (chunk) => {
                    process.stdout.write(chunk);
                })
                .on('error', (error) => {
                    prettyConsole.error(error.message);
                    reject()
                })
                .on("end", () => {
                    process.stdout.write(os.EOL);
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
        const isFilePathAbsolute = path.isAbsolute(pathToFile);
        let pathToSourceFile
        if (isFilePathAbsolute) {
            pathToSourceFile = pathToFile;
        } else {
            pathToSourceFile = path.join(this.directory, pathToFile);
        }

        try {
            await remove(pathToSourceFile);
        } catch {
            prettyConsole.error('File is not found');
        }
    }

    async cp(pathToFile, pathToDirectory) {
        const isFilePathAbsolute = path.isAbsolute(pathToFile);
        const isDestinationPathAbsolute = path.isAbsolute(pathToDirectory);
        const filePathArray = pathToFile.split(this.pathSeparator);
        const fileName = filePathArray.pop();
        let pathToSourceFile, pathToDestinationFile;

        if (isFilePathAbsolute) {
            pathToSourceFile = pathToFile;
        } else {
            pathToSourceFile = path.join(this.directory, pathToFile);
        }

        if (isDestinationPathAbsolute) {
            pathToDestinationFile = path.join(pathToDirectory, fileName);
        } else {
            pathToDestinationFile = path.join(this.directory, pathToDirectory, fileName);
        }
        try {
            await access(pathToDestinationFile);
            prettyConsole.error(`Destination file ${pathToDestinationFile} is already exits`)
        } catch (error) {
            if (error.code === 'ENOENT') {
                try {
                    await access(pathToSourceFile);
                    const sourceStream = createReadStream(pathToSourceFile)
                    const destinationStream = createWriteStream(pathToDestinationFile);
                    await pipeline(sourceStream, destinationStream)
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

    async hash(pathToFile) {
        const isFilePathAbsolute = path.isAbsolute(pathToFile);
        let fullPath;
        if (isFilePathAbsolute) {
            fullPath = pathToFile;
        } else {
            fullPath = path.join(this.directory, pathToFile)
        }

        return new Promise((resolve, reject) => {
            const fileStream = createReadStream(fullPath);
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
                    reject(error);
                })
        })


    }
    async compress (pathToFile, pathToDestination) {

    }
    async decompress (pathToFile, pathToDestination) {

    }

    os(param) {
        switch (param) {
            case '--EOL':
                console.log(os.EOL);
                break;
            case '--cpus':
                console.log(os.cpus());
                break;
            case '--homedir':
                console.log(os.homedir());
                break;
            case '--username':
                console.log(os.userInfo().username);
                break;
            case '--architecture':
                console.log(os.arch());
                break;
            default:
                prettyConsole.error('Invalid input');
        }
    }
}
