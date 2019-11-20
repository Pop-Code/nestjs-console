import { createSpinner, formatResponse } from '../helpers';

describe('Helpers', () => {
    it('should create an ora spinner', () => {
        const spinner = createSpinner({ text: 'hello' });
        expect(spinner).toBeDefined();
    });
    it('should format the response ', () => {
        const formated = formatResponse('{foo: ["bar"]}', { parser: 'json' });
        expect(formated).toContain(`{ "foo": ["bar"] }`);
    });
});
