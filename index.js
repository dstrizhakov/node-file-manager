import {readdir, stat, cp} from 'node:fs/promises';
import path from 'node:path';
import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import os from 'node:os';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(os.homedir())


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
            const items = await readdir(this.directory);
            const listTable = [];
            for (let i = 0; i < items.length; i++) {
                const itemStat = await stat(path.join(this.directory, items[i]));
                listTable.push({Name: items[i], Type: itemStat.isDirectory() ? 'directory' : 'file'})
            }
            console.table(listTable);
        } catch {
            this.handleError();
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

new FileManager(readline.createInterface({input, output}), os.homedir());
