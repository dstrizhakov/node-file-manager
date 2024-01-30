import {readdir, stat, cp} from 'node:fs/promises';
import path from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class FileManager {
    constructor() {
        this.currentDirectory = __dirname;
        this.user = 'anonymous';
    }

    start() {
        process.argv.forEach((arg) => {
            if (arg.startsWith('--username'))
                this.user = arg.split('=')[1];
        })
        const rl = readline.createInterface({ input, output });
        rl.write(`Welcome to the File Manager, ${this.user}!\n`)
        rl.on('line', async (line) => {
            const command = line.toString().trim().split(' ')[0];
            const params = line.toString().trim().split(' ').slice(1);
            switch (command) {
                case 'ls' :
                    await this.ls();
                    break;
            }
        })
            .on ('close', () => {
                rl.write(`Thank you for using File Manager, ${this.user}, goodbye!\n`)
                process.exit(0);
            })
    }

    async ls() {
        try {
            const items = await readdir(this.currentDirectory);
            const listTable = [];
            for (let i = 0; i < items.length; i++) {
                const itemStat = await stat(path.join(this.currentDirectory, items[i]));
                listTable.push({Name: items[i], Type: itemStat.isDirectory() ? 'directory' : 'file'})
            }
            console.table(listTable);
        } catch (error) {
            throw Error('FS operation failed')
        }
    }
}

const fileManager = new FileManager();
fileManager.start()