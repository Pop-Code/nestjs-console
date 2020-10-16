import * as ora from 'ora';

/**
 * Create an ora spinner
 * @see https://www.npmjs.com/package/ora
 */
export const createSpinner = (opts?: ora.Options): ora.Ora => ora(opts);

/**
 * Format a response using prettier
 */
export const formatResponse = (
    data: string | Record<string, unknown> | Error,
    options?: { space?: number }
): string => {
    const opts = { space: 2, ...options };
    return data instanceof Error ? data.message : JSON.stringify(data, null, opts.space);
};
