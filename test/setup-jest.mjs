// In ESM, the jest object is not a global: expose it for the tests (jest.fn, jest.spyOn...)
import { jest } from '@jest/globals';

globalThis.jest = jest;
