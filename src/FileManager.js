import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { prettyConsole } from "./console.js";
export class FileManager {
    constructor(cliController, fileController, osController, gzController, hashController, directory) {
        this.directory = directory;
        this.pathSeparator = path.sep;
        this.user = 'anonymous';
        this.cliController = cliController;
        this.fileController = fileController;
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
                            const pathToNewFile = path.join(this.directory, params[0]);
                            await this.fileController.add(pathToNewFile);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'cat':
                        if (params[0]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            await this.fileController.cat(sourcePath);
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'rn':
                        if (params[0] && params[1]) {
                            const isAbsolute = path.isAbsolute(params[0]);
                            let pathToSourceFile, pathToRenamedFile;
                            if (isAbsolute) {
                                pathToSourceFile = params[0];
                                pathToRenamedFile = pathToSourceFile
                                    .split(this.pathSeparator).reverse()
                                    .slice(1).reverse()
                                    .join(this.pathSeparator) + this.pathSeparator + params[1];
                            } else {
                                pathToSourceFile = path.join(this.directory, params[0]);
                                pathToRenamedFile = path.join(this.directory, params[1]);
                            }
                            await this.fileController.rn(pathToSourceFile, pathToRenamedFile)
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'rm':
                        if (params[0]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            await this.fileController.rm(sourcePath)
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'cp':
                        if (params[0] && params[1]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            const destinationPath = path.join(this.getAbsolutePath(params[1]), path.basename(params[0]));
                            await this.fileController.cp(sourcePath, destinationPath)
                            prettyConsole.info(`You are currently in ${this.directory}`);
                        } else {
                            prettyConsole.error(`Invalid input`);
                        }
                        break;
                    case 'mv':
                        if (params[0] && params[1]) {
                            const sourcePath = this.getAbsolutePath(params[0]);
                            const destinationPath = path.join(this.getAbsolutePath(params[1]), path.basename(params[0]));
                            await this.fileController.mv(sourcePath, destinationPath)
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
                        // here is params[1] is - path to compressed file
                        // it means the command should be like: "compress file.txt archive.gz"
                        // or "compress file.txt c:\users\username\archive.gz"
                        // https://discord.com/channels/755676888680366081/755676889212780622/1051549297340067840
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
                        // here is params[1] is - path to decompressed file
                        // it means the command should be like: "decompress archive.gz file.txt"
                        // or "decompress archive.gz c:\users\username\file.txt"
                        // https://discord.com/channels/755676888680366081/755676889212780622/1051549297340067840
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
                const newPath = path.join(this.directory, pathTo);
                await readdir(newPath);
                this.directory = newPath;
            }
        } catch {
            prettyConsole.error('No such directory');
        }
    }

    getAbsolutePath(absoluteOrRelativePath) {
        const isFilePathAbsolute = path.isAbsolute(absoluteOrRelativePath);
        return isFilePathAbsolute ? absoluteOrRelativePath : path.join(this.directory, absoluteOrRelativePath)
    }

}
