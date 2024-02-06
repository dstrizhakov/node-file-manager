import os from 'node:os';
import { FileManager } from "./src/FileManager.js";
import cliController from './src/cliController.js';
import osController from './src/osController.js';
import gzController from './src/gzController.js';
import hashController from './src/hashController.js';
import fileController from './src/fileController.js';

const homeDir = os.homedir();

new FileManager(cliController, fileController, osController, gzController, hashController, homeDir);