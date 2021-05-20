/**
 * @module Helpers
 */
import * as ora from 'ora';

/**
 * Create an ora spinner
 * @see https://www.npmjs.com/package/ora
 */
export const createSpinner = (opts?: ora.Options): ora.Ora => ora(opts);
