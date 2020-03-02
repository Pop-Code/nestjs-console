import ora from 'ora';
import { format, Options as PrettierOptions } from 'prettier';

/**
 * Create an ora spinner
 * @see https://www.npmjs.com/package/ora
 */
export const createSpinner = (opts?: ora.Options): ora.Ora => ora(opts);

/**
 * Format a response using prettier
 */
export const formatResponse = (data: string | Error, options?: PrettierOptions): string =>
    data instanceof Error ? data.message : format(data, options);
