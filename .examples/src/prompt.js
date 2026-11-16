var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
export class PromptError extends Error {
}
let PromptService = class PromptService {
    constructor() {
        this.options = {};
        this.buffer = '';
        this.ended = false;
    }
    configure(options) {
        this.options = { ...this.options, ...options };
        this.buffer = '';
        this.ended = false;
        return this;
    }
    isInteractive() {
        return this.options.interactive ?? !!this.getInput().isTTY;
    }
    async input(message, options = {}) {
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
    async confirm(message, defaultValue = false) {
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
    async password(message, options = {}) {
        for (;;) {
            const answer = await this.ask(`${message} `, true);
            const valid = options.validate ? options.validate(answer) : true;
            if (valid === true) {
                return answer;
            }
            this.write(`${valid}\n`);
        }
    }
    async select(message, choices, options = {}) {
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
    getInput() {
        return this.options.input ?? process.stdin;
    }
    write(text) {
        (this.options.output ?? process.stderr).write(text);
    }
    async ask(question, hidden = false) {
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
        }
        finally {
            if (raw) {
                input.setRawMode?.(false);
                this.write('\n');
            }
        }
    }
    readLine() {
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
    readHidden() {
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
                }
                else {
                    answer += char;
                }
            }
            return this.ended && answer.length > 0 ? answer : undefined;
        });
    }
    read(consume) {
        const input = this.getInput();
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                input.off('data', onData);
                input.off('end', onEnd);
                input.off('error', onError);
                input.pause();
            };
            const check = () => {
                let value;
                try {
                    value = consume();
                }
                catch (e) {
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
            const onData = (chunk) => {
                this.buffer += chunk.toString();
                check();
            };
            const onEnd = () => {
                this.ended = true;
                check();
            };
            const onError = (error) => {
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
};
PromptService = __decorate([
    Injectable()
], PromptService);
export { PromptService };
