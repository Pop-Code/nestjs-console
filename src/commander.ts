import * as commander from 'commander';

export interface Command extends commander.Command {
    forwardSubCommands(): Command;
}

/**
 * Patch commander to support git style subcommand without to works with external file for program
 * @see https://github.com/tj/commander.js/issues/764#issuecomment-399739989
 */
function forwardSubCommands(): Command {
    if (this._args.length > 0) {
        throw new Error(
            'Sub commands cannot be applied to command with explicit args'
        );
    }
    const listener = (args: any[], unknown: any[]) => {
        // Parse any so-far unknown options
        args = args || [];
        unknown = unknown || [];
        const parsed = this.parseOptions(unknown);
        if (parsed.args.length) {
            args = parsed.args.concat(args);
        }

        // Output help if necessary
        if (args.length === 0) {
            this.help();
            process.exit(0);
        }

        unknown = parsed.unknown;
        this.parseArgs(args, unknown);
    };
    const parent = this.parent || this;
    const name = parent === this ? '*' : this._name;
    parent.on('command:' + name, listener.bind(this));
    if (this._alias) {
        parent.on('command:' + this._alias, listener.bind(this));
    }
    return this;
}

commander.Command.prototype.forwardSubcommands = forwardSubCommands;

export { commander, forwardSubCommands };
