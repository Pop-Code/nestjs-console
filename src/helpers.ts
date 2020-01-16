import ora = require('ora');
import { format, Options as PrettierOptions } from 'prettier';

/**
 * Create an ora spinner
 * @see https://www.npmjs.com/package/ora
 */
export function createSpinner(opts?: ora.Options) {
    return ora(opts);
}

/**
 * Format a response using prettier
 */
export function formatResponse(
    data: string | Error,
    options?: PrettierOptions
) {
    if (data instanceof Error) {
        return data.message;
    }
    return format(data, options);
}
