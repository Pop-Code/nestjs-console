import ora = require('ora');
import { format, Options as PrettierOptions } from 'prettier';
import { CommanderError } from 'commander';
/**
 * Create an ora spinner
 * @param opts
 * @see https://www.npmjs.com/package/ora
 */
export function createSpinner(opts?: ora.Options) {
    return ora(opts);
}

export function formatResponse(
    data: string | Error,
    options?: PrettierOptions
) {
    if (data instanceof Error) {
        return data.message;
    }
    return format(data, options);
}
