/**
 * @module Completion
 */
import * as commander from 'commander';

import { ConsoleService, getRegisteredArguments } from './service';

export type CompletionShell = 'bash' | 'zsh' | 'fish';

export const COMPLETION_SHELLS: readonly CompletionShell[] = ['bash', 'zsh', 'fish'];

/**
 * The name of the hidden command the shell scripts call to get the completions
 */
export const COMPLETE_COMMAND_NAME = '__complete';

export interface CompletionOptions {
    /**
     * The name of the command printing the completion script (default "completion")
     */
    command?: string;

    /**
     * The name of the executable the shell completes (default: the name of the root cli).
     * It must be a command in the PATH, eg the "bin" of your package.
     */
    programName?: string;
}

const findSubCommand = (command: commander.Command, name: string): commander.Command | undefined =>
    command.commands.find((c) => c.name() === name || c.aliases().includes(name));

const findOption = (command: commander.Command, flag: string): commander.Option | undefined =>
    command
        .createHelp()
        .visibleOptions(command)
        .concat(command.options)
        .find((o) => o.long === flag || o.short === flag);

const filterByPrefix = (values: Iterable<string>, prefix: string): string[] =>
    [...new Set(values)].filter((value) => value.startsWith(prefix));

/**
 * Get the completions of the last word (the one being typed, possibly empty)
 * @param root The root cli
 * @param words The words typed after the program name
 */
export const getCompletions = (root: commander.Command, words: readonly string[]): string[] => {
    const current = words.length > 0 ? words[words.length - 1] : '';
    let command = root;
    let argumentIndex = 0;
    let optionWithValue: commander.Option | undefined;
    let operandsOnly = false;
    const usedOptions = new Set<commander.Option>();

    for (const word of words.slice(0, -1)) {
        if (optionWithValue) {
            optionWithValue = undefined;
            continue;
        }
        if (!operandsOnly && word === '--') {
            operandsOnly = true;
            continue;
        }
        if (!operandsOnly && word.startsWith('-') && word !== '-') {
            const option = findOption(command, word.split('=')[0]);
            if (option && !option.variadic) {
                usedOptions.add(option);
            }
            if (option?.required && !word.includes('=')) {
                optionWithValue = option;
            }
            continue;
        }
        const subCommand = !operandsOnly && argumentIndex === 0 ? findSubCommand(command, word) : undefined;
        if (subCommand) {
            command = subCommand;
            usedOptions.clear();
            continue;
        }
        argumentIndex++;
    }

    if (optionWithValue) {
        return filterByPrefix(optionWithValue.argChoices ?? [], current);
    }

    const help = command.createHelp();
    if (!operandsOnly && current.startsWith('-')) {
        return filterByPrefix(
            help
                .visibleOptions(command)
                .filter((o) => !usedOptions.has(o))
                .flatMap((o) => [o.long, o.short].filter((f): f is string => !!f)),
            current
        );
    }

    const candidates: string[] = [];
    if (argumentIndex === 0 && !operandsOnly) {
        candidates.push(...help.visibleCommands(command).map((c) => c.name()));
    }
    const args = getRegisteredArguments(command);
    const argument = args[argumentIndex] ?? (args[args.length - 1]?.variadic ? args[args.length - 1] : undefined);
    candidates.push(...((argument as any)?.argChoices ?? []));
    return filterByPrefix(candidates, current);
};

/**
 * Get the completion script of a shell
 * @param shell The shell
 * @param programName The name of the executable to complete
 */
export const getCompletionScript = (shell: CompletionShell, programName: string): string => {
    const fn = `_${programName.replace(/[^a-zA-Z0-9_]/g, '_')}_completion`;
    const complete = `${programName} ${COMPLETE_COMMAND_NAME} --`;
    switch (shell) {
        case 'bash':
            return [
                `# ${programName} completion for bash, add to ~/.bashrc:`,
                `#   source <(${programName} completion bash)`,
                `${fn}() {`,
                `    local IFS=$'\\n'`,
                `    COMPREPLY=($(${complete} "\${COMP_WORDS[@]:1:$COMP_CWORD}" 2>/dev/null))`,
                `}`,
                `complete -o default -F ${fn} ${programName}`,
                ''
            ].join('\n');
        case 'zsh':
            return [
                `#compdef ${programName}`,
                `# ${programName} completion for zsh, add to ~/.zshrc after compinit:`,
                `#   source <(${programName} completion zsh)`,
                `${fn}() {`,
                `    local -a completions`,
                `    completions=("\${(@f)$(${complete} "\${(@)words[2,CURRENT]}" 2>/dev/null)}")`,
                `    if [[ -n "$completions" ]]; then`,
                `        compadd -- "\${completions[@]}"`,
                `    else`,
                `        _files`,
                `    fi`,
                `}`,
                `compdef ${fn} ${programName}`,
                ''
            ].join('\n');
        case 'fish':
            return [
                `# ${programName} completion for fish, save to ~/.config/fish/completions/${programName}.fish:`,
                `#   ${programName} completion fish > ~/.config/fish/completions/${programName}.fish`,
                `function ${fn}`,
                `    set -l tokens (commandline -opc)`,
                `    set -l current (commandline -ct)`,
                `    ${complete} $tokens[2..-1] "$current" 2>/dev/null`,
                `end`,
                `complete -c ${programName} -f -a '(${fn})'`,
                ''
            ].join('\n');
        default:
            throw new Error(`Unsupported shell "${shell}", use one of ${COMPLETION_SHELLS.join(', ')}`);
    }
};

/**
 * Add the "completion [shell]" command and the hidden command used by the completion scripts
 */
export const registerCompletion = (service: ConsoleService, options: CompletionOptions): void => {
    const root = service.getRootCli();
    const currentShell = (process.env.SHELL ?? '').split('/').pop();
    const defaultShell = COMPLETION_SHELLS.find((shell) => shell === currentShell) ?? 'bash';
    // commander always defines writeOut (process.stdout by default)
    const write = (command: commander.Command, text: string): void =>
        (command.configureOutput() as Required<commander.OutputConfiguration>).writeOut(text);

    service.createCommand(
        {
            command: options.command ?? 'completion',
            description: 'Print the shell completion script',
            arguments: [
                new commander.Argument('[shell]', 'the shell')
                    .choices(COMPLETION_SHELLS)
                    .default(defaultShell, 'current shell or bash')
            ]
        },
        (shell: CompletionShell, _options: unknown, command: commander.Command) => {
            const script = getCompletionScript(shell, options.programName ?? root.name());
            write(command, script);
            return script;
        },
        root
    );

    service.createCommand(
        {
            command: `${COMPLETE_COMMAND_NAME} [words...]`,
            hidden: true,
            allowUnknownOption: true,
            configure: (command) => command.helpOption(false)
        },
        (words: string[], _options: unknown, command: commander.Command) => {
            const completions = getCompletions(root, words);
            write(command, completions.length ? `${completions.join('\n')}\n` : '');
            return completions;
        },
        root
    );
};
