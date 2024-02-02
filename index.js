import fs, { readdir, cp, access, rename, rm as remove } from 'node:fs/promises';
import { createWriteStream, createReadStream } from 'node:fs';
import path from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import os from 'node:os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileManager {

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
        console.log(`Welcome to the File Manager, ${this.user}!`);
        console.log(`You are currently in ${this.directory}`);
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
                        console.log(`You are currently in ${this.directory}`);
                        break;
                    case 'os':
                        this.os(params[0]);
                        console.log(`You are currently in ${this.directory}`);
                        break;
                    case 'up':
                        this.up();
                        console.log(`You are currently in ${this.directory}`);
                        break;
                    case 'cd':
                        if (params[0]) {
                            await this.cd(params[0]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case 'add':
                        if (params[0]) {
                            await this.add(params[0]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case 'cat':
                        if (params[0]) {
                            await this.cat(params[0]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case 'rn':
                        if (params[0] && params[1]) {
                            await this.rn(undefined, params[0], params[1]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case 'rm':
                        if (params[0]) {
                            await this.rm(params[0]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case 'cp':
                        if (params[0]) {
                            await this.cp(params[0]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case 'mv':
                        if (params[0]) {
                            await this.mv(params[0]);
                            console.log(`You are currently in ${this.directory}`);
                        } else {
                            console.log('Invalid input');
                        }
                        break;
                    case '.exit':
                        this.exit();
                        break;
                    default:
                        if (command) {
                            console.log('Invalid input');
                        }
                }

            })
            .on('SIGINT', () => {
                this.exit();
            })
    }

    exit() {
        console.log(`Thank you for using File Manager, ${this.user}, goodbye!`);
        process.exit()
    }

    handleError() {
        console.log('Operation failed')
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
            this.handleError();
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
            // const isAbsolute = pathTo.split(':\\').length > 1;
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
            console.log('No such directory')
        }
    }

    async add(fileName) {
        const pathToNewFile = path.join(this.directory, fileName);

        // we can create new file using stream but its not required in this case
        // const writeStream = createWriteStream(pathToNewFile, 'utf8');
        // writeStream.on('error', (error) => {
        //     console.log(error);
        // })
        // writeStream.end();

        try {
            await fs.writeFile(pathToNewFile, content, { flag: 'wx' });
        } catch (error) {
            if (e.code === 'EEXIST') {
                console.log(e)
            }
        }

    }

    cat(fileName) {
        const pathToFile = path.join(this.directory, fileName);
        const readStream = createReadStream(pathToFile);
        readStream
            .on('data', (chunk) => {
                process.stdout.write(chunk);
            })
            .on('error', (error) => {
                console.log(error);
            })
    }

    async rn(pathToFile, currentName, newName) {
        const pathToSourceFile = path.join(this.directory, currentName);
        const pathToRenamedFile = path.join(this.directory, newName);

        try {
            await access(pathToRenamedFile);
            throw Error('Файл с таким именем уже есть в этой папке');
        } catch (error) {
            if (error.code === 'ENOENT') {
                try {
                    await access(pathToSourceFile);
                    await rename(pathToSourceFile, pathToRenamedFile);
                } catch (error) {
                    console.log('Исходный файл не найден')
                }
            } else {
                console.log(error)
            }
        }


    }

    async rm(fileName) {
        const pathToFile = path.join(this.directory, fileName);
        try {
            await remove(pathToFile);
        } catch {
            console.log('Файл не найден');
        }
    }

    async cp(pathToFile, pathToNewDirectory) {

    }

    async mv(pathToFile, pathToNewDirectory) {

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
                console.log('Invalid input');
        }
    }
}

const homeDir = os.homedir();
const rl = readline.createInterface({ input, output });

new FileManager(rl, homeDir);
