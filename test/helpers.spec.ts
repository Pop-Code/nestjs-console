import { createSpinner } from '../src/helpers';

describe('Helpers', () => {
    it('should create an ora spinner', () => {
        const spinner = createSpinner({ text: 'hello' });
        expect(spinner).toBeDefined();
    });
});
