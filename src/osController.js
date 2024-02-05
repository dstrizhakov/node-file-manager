import os from 'node:os';
import { prettyConsole } from './console.js';

class OsController {
    constructor() {
        this.eol = os.EOL;
    }
    os(param) {
        switch (param) {
            case '--EOL':
                prettyConsole.info(this.eol);
                break;
            case '--cpus':
                prettyConsole.info(`Total amount of cpus: ${os.cpus().length}`);
                os.cpus().forEach((cpu, index) => {
                    prettyConsole.info(`[${index + 1}]: Model: ${cpu.model}; Clock rate: ${cpu.speed/1000} GHz`);
                })

                // prettyConsole.info(`Model: ${os.cpus().length}`);
                // console.info(os.cpus());
                break;
            case '--homedir':
                prettyConsole.info(`Homedir: ${os.homedir()}`);
                break;
            case '--username':
                prettyConsole.info(`System user name: ${os.userInfo().username}`);
                break;
            case '--architecture':
                prettyConsole.info(`CPU architecture: ${os.arch()}`);
                break;
            default:
                prettyConsole.error('Invalid input');
        }
    }
}

const osController = new OsController()

export default osController