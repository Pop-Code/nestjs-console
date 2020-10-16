import { createSpinner, formatResponse } from '../helpers';

describe('Helpers', () => {
    it('should create an ora spinner', () => {
        const spinner = createSpinner({ text: 'hello' });
        expect(spinner).toBeDefined();
    });
    it('should format the response ', () => {
        const formated = formatResponse({ foo: ['bar'] });
        const obj = JSON.parse(formated);
        expect(obj.foo).toHaveLength(1);
        expect(obj.foo[0]).toBe('bar');
    });
});
