const { formatTimestamp, calculateDiscount } = require('../src/utils');

describe('Utility Functions', () => {
    describe('formatTimestamp', () => {
        it('should format a valid ISO string correctly', () => {
            const iso = '2023-01-01T12:00:00Z';
            const result = formatTimestamp(iso);
            // Result depends on locale, but checking it's not 'Invalid Date' or 'N/A'
            expect(result).not.toBe('Invalid Date');
            expect(result).not.toBe('N/A');
        });

        it('should return "N/A" for null or undefined input', () => {
            expect(formatTimestamp(null)).toBe('N/A');
            expect(formatTimestamp(undefined)).toBe('N/A');
        });

        it('should return "Invalid Date" for bad strings', () => {
            expect(formatTimestamp('not-a-date')).toBe('Invalid Date');
        });
    });

    describe('calculateDiscount', () => {
        it('should calculate discount correctly', () => {
            expect(calculateDiscount(100, 20)).toBe(80.00);
            expect(calculateDiscount(50, 50)).toBe(25.00);
            expect(calculateDiscount(10.99, 10)).toBe(9.89);
        });

        it('should throw error for invalid inputs', () => {
            expect(() => calculateDiscount(-10, 10)).toThrow('Invalid input');
            expect(() => calculateDiscount(100, 110)).toThrow('Invalid input');
        });
    });
});
