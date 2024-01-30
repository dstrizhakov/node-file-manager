import {readdir, stat, cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class FileManager {
    constructor() {
        this.currentDirectory = __dirname;
        this.user = 'anonimous'
        this.systemUser = ''
    }

    start() {
        process.stdin.on('data', (data) => {
            switch (data.toString().trim()) {
                case 'ls' :
                    this.ls();
                    break;
            }
        })
    }

    async ls(){
        try {
            const items = await readdir(this.currentDirectory);
            const listTable = await this.getlistTable(items);
            console.table(listTable);
        } catch (error) {
            throw Error('FS operation failed')
        }
    }

    async getlistTable (items) {
        const result = [];
        for(let i = 0; i < items.length; i++) {
            const itemStat = await stat(path.join(this.currentDirectory, items[i]));
            result.push({Name: items[i], Type: itemStat.isDirectory() ? 'directory':'file'})
        }
        return result;
    }
}

const fileManager = new FileManager();

fileManager.start()