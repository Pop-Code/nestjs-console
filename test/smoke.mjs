// Check that ESM projects can use named imports from the CommonJS build
import * as nestjsConsole from '../dist/index.js';
import { Arg, BootstrapConsole, Cmd, Command, Console, ConsoleModule, ConsoleService, Opt, runCommand } from '../dist/index.js';

const exported = { Arg, BootstrapConsole, Cmd, Command, Console, ConsoleModule, ConsoleService, Opt, runCommand };
const missing = Object.entries(exported)
    .filter(([, value]) => typeof value !== 'function')
    .map(([name]) => name);
if (missing.length > 0 || nestjsConsole.default === undefined) {
    console.error(`Missing ESM exports: ${missing.join(', ')}`);
    process.exit(1);
}
console.log('ESM import ok');
