import * as readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';
import os from 'node:os';
import {FileManager} from "./src/FileManager.js";

const homeDir = os.homedir();
const rl = readline.createInterface({input, output});

new FileManager(rl, 'G:\\RSSchool\\node-file-manager');
