/**
 * @module Prompt
 */
import { Injectable } from '@nestjs/common';

type PromptInput = NodeJS.ReadableStream & { isTTY?: boolean; setRawMode?: (mode: boolean) => unknown };

/**
 * Where the prompts read the answers and write the questions
 */
export interface PromptOptions {
    /**
     * The stream to read the answers from (default: process.stdin)
     */
    input?: PromptInput;

    /**
     * The stream to write the questions to (default: process.stderr, so the output of the command can be piped)
     */
    output?: NodeJS.WritableStream;

    /**
     * Force the interactive mode. By default the prompts are interactive when the input is a TTY.
     */
    interactive?: boolean;
}

export interface InputPromptOptions {
    /**
     * The answer when the user just presses enter
     */
    default?: string;

    /**
     * Return true if the answer is valid, or the error message to display (the question is asked again)
     */
    validate?: (answer: string) => true | string;
}

/**
 * The error thrown when a question cannot be asked or answered
 */
export class PromptError extends Error {}

/**
 * Ask questions in the terminal.
 * Inject it in your providers to ask questions in your commands.
 */
@Injectable()
export class PromptService {
    protected options: PromptOptions = {};

    /**
     * Characters read but not consumed yet (several answers can come in one chunk, eg from a pipe)
     */
    protected buffer = '';

    protected ended = false;

    /**
     * Change the streams and the interactive mode
     */
    configure(options: PromptOptions): this {
        this.options = { ...this.options, ...options };
        this.buffer = '';
        this.ended = false;
        return this;
    }

    /**
     * True if questions can be asked (the input is a TTY, or the interactive mode is forced)
     */
    isInteractive(): boolean {
        return this.options.interactive ?? !!this.getInput().isTTY;
    }

    /**
     * Ask for a text
     */
    async input(message: string, options: InputPromptOptions = {}): Promise<string> {
        for (;;) {
            const suffix = options.default !== undefined ? ` (${options.default})` : '';
            const answer = (await this.ask(`${message}${suffix} `)).trim();
            const value = answer === '' && options.default !== undefined ? options.default : answer;
            const valid = options.validate ? options.validate(value) : true;
            if (valid === true) {
                return value;
            }
            this.write(`${valid}\n`);
        }
    }

    /**
     * Ask a yes/no question
     */
    async confirm(message: string, defaultValue = false): Promise<boolean> {
        for (;;) {
            const answer = (await this.ask(`${message} ${defaultValue ? '(Y/n)' : '(y/N)'} `)).trim().toLowerCase();
            if (answer === '') {
                return defaultValue;
            }
            if (['y', 'yes'].includes(answer)) {
                return true;
            }
            if (['n', 'no'].includes(answer)) {
                return false;
            }
            this.write('Please answer yes or no\n');
        }
    }

    /**
     * Ask for a secret, the answer is not displayed
     */
    async password(message: string, options: Omit<InputPromptOptions, 'default'> = {}): Promise<string> {
        for (;;) {
            const answer = await this.ask(`${message} `, true);
            const valid = options.validate ? options.validate(answer) : true;
            if (valid === true) {
                return answer;
            }
            this.write(`${valid}\n`);
        }
    }

    /**
     * Ask to choose a value, by number or by value
     */
    async select<T extends string>(message: string, choices: readonly T[], options: { default?: T } = {}): Promise<T> {
        if (choices.length === 0) {
            throw new PromptError(`No choices for "${message}"`);
        }
        const list = choices.map((choice, index) => `  ${index + 1}) ${choice}`).join('\n');
        for (;;) {
            this.write(`${message}\n${list}\n`);
            const answer = await this.input('Answer:', { default: options.default });
            const index = Number(answer);
            if (Number.isInteger(index) && index >= 1 && index <= choices.length) {
                return choices[index - 1];
            }
            const choice = choices.find((c) => c === answer);
            if (choice !== undefined) {
                return choice;
            }
            this.write(`Choose a number between 1 and ${choices.length}\n`);
        }
    }

    protected getInput(): PromptInput {
        return this.options.input ?? process.stdin;
    }

    protected write(text: string): void {
        (this.options.output ?? process.stderr).write(text);
    }

    protected async ask(question: string, hidden = false): Promise<string> {
        if (!this.isInteractive()) {
            throw new PromptError(`Cannot ask "${question.trim()}": the input is not interactive`);
        }
        this.write(question);
        const input = this.getInput();
        const raw = hidden && input.isTTY && typeof input.setRawMode === 'function';
        if (raw) {
            input.setRawMode?.(true);
        }
        try {
            const answer = await (raw ? this.readHidden() : this.readLine());
            if (answer === undefined) {
                throw new PromptError(`No answer to "${question.trim()}": the input ended`);
            }
            return answer;
        } finally {
            if (raw) {
                input.setRawMode?.(false);
                this.write('\n');
            }
        }
    }

    /**
     * Read the next line, keeping what comes after it for the next questions
     */
    protected readLine(): Promise<string | undefined> {
        return this.read(() => {
            const index = this.buffer.indexOf('\n');
            if (index === -1) {
                return undefined;
            }
            const line = this.buffer.slice(0, index).replace(/\r$/, '');
            this.buffer = this.buffer.slice(index + 1);
            return line;
        });
    }

    /**
     * Read the characters typed in raw mode until enter (backspace deletes, ctrl+c cancels)
     */
    protected readHidden(): Promise<string | undefined> {
        let answer = '';
        return this.read(() => {
            while (this.buffer.length > 0) {
                const char = this.buffer[0];
                this.buffer = this.buffer.slice(1);
                if (char === '\r' || char === '\n') {
                    return answer;
                }
                if (char === '\u0003') {
                    throw new PromptError('Cancelled');
                }
                if (char === '\u007f' || char === '\b') {
                    answer = answer.slice(0, -1);
                } else {
                    answer += char;
                }
            }
            return this.ended && answer.length > 0 ? answer : undefined;
        });
    }

    /**
     * Read from the input until `consume` returns a value
     */
    protected read(consume: () => string | undefined): Promise<string | undefined> {
        const input = this.getInput();
        return new Promise<string | undefined>((resolve, reject) => {
            const cleanup = () => {
                input.off('data', onData);
                input.off('end', onEnd);
                input.off('error', onError);
                // a paused input does not keep the process alive
                input.pause();
            };
            const check = (): boolean => {
                let value: string | undefined;
                try {
                    value = consume();
                } catch (e) {
                    cleanup();
                    reject(e);
                    return true;
                }
                if (value !== undefined) {
                    cleanup();
                    resolve(value);
                    return true;
                }
                if (this.ended) {
                    cleanup();
                    const rest = this.buffer;
                    this.buffer = '';
                    resolve(rest.length > 0 ? rest : undefined);
                    return true;
                }
                return false;
            };
            const onData = (chunk: Buffer | string) => {
                this.buffer += chunk.toString();
                check();
            };
            const onEnd = () => {
                this.ended = true;
                check();
            };
            const onError = (error: Error) => {
                cleanup();
                reject(error);
            };
            if (check()) {
                return;
            }
            input.on('data', onData);
            input.on('end', onEnd);
            input.on('error', onError);
            input.resume();
        });
    }
}
