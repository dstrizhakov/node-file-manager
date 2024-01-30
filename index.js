import fs, {readdir, stat, cp} from 'node:fs/promises';
import path from 'node:path';
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import os from 'node:os';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname)

class FileManager {
    constructor(cli, directory) {
        this.directory = directory;
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

        this.cli.on('line', async (line) => {
            const command = line.toString().trim().split(' ')[0];
            const params = line.toString().trim().split(' ').slice(1);
            switch (command) {
                case 'ls' :
                    await this.ls();
                    console.log(`You are currently in ${this.directory}`);
                    break;
                case 'os' :
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
            const items = await readdir(this.directory, {withFileTypes: true});
            const listTable = [];
            for (let i = 0; i < items.length; i++) {
                listTable.push({Name: items[i].name, Type: items[i].isDirectory() ? 'directory' : 'file'})
            }
            console.table(listTable);
        } catch {
            this.handleError();
        }
    }

    up() {
        let newPath;
        const pathParts = this.directory.split('\\');
        if (pathParts.length === 2) {
            newPath = pathParts[0] + '\\';
        } else {
            newPath = pathParts.reverse().slice(1).reverse().join('\\');
        }
        this.directory = newPath;
    }

    async cd(path) {
        try {
            const isAbsolute = path.split(':\\').length > 1;
            if (isAbsolute) {
                await readdir(path);
                this.directory = path;
            } else {
                const pathParts = this.directory.split('\\');
                pathParts.push(path);
                const newPath = pathParts.join('\\');
                await readdir(newPath);
                this.directory = newPath;
            }
        } catch {
            console.log('No such directory')
        }
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
new FileManager(readline.createInterface({input, output}), __dirname);
