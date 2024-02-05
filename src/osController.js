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
                console.info(os.cpus());
                break;
            case '--homedir':
                prettyConsole.info(os.homedir());
                break;
            case '--username':
                prettyConsole.info(os.userInfo().username);
                break;
            case '--architecture':
                prettyConsole.info(os.arch());
                break;
            default:
                prettyConsole.error('Invalid input');
        }
    }
}

const osController = new OsController()

export default osController