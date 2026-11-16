// Check the exports of the built package, from ESM and from CommonJS (require(esm), Node >= 22.12)
import { createRequire } from 'module';

import * as esm from '../dist/index.js';

const cjs = createRequire(import.meta.url)('../dist/index.js');
const names = [
    'Arg',
    'BootstrapConsole',
    'Cmd',
    'Command',
    'Console',
    'ConsoleModule',
    'ConsoleOption',
    'ConsoleService',
    'Opt',
    'PromptService',
    'runCommand'
];
const missing = names.filter((name) => typeof esm[name] !== 'function' || cjs[name] !== esm[name]);
if (missing.length > 0) {
    console.error(`Missing exports: ${missing.join(', ')}`);
    process.exit(1);
}
console.log('ESM and CommonJS exports ok');
