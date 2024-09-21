import { H2Formatter } from "../src/H2Formatter";

describe('H2Formatter', () => {
    it('should create instance', () => {
        const formatter = new H2Formatter();
        expect(formatter).toBeInstanceOf(H2Formatter);
    });
});