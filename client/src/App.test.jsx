import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('App Component', () => {
    
    beforeEach(() => {
        // Mock fetch before each test
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('displays initial loading state', () => {
        // Return a pending promise to simulate loading
        global.fetch.mockReturnValue(new Promise(() => {}));
        
        render(<App />);
        
        expect(screen.getByText(/ShopSmart and save more!/i)).toBeInTheDocument();
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();
    });

    it('fetches and displays backend data successfully', async () => {
        const mockData = {
            status: 'ok',
            message: 'Service is running',
            timestamp: '2023-01-01T12:00:00Z'
        };

        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData),
        });

        render(<App />);

        // Wait for the data to be applied to the DOM
        await waitFor(() => {
            expect(screen.queryByText(/Loading backend status.../i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Backend Status')).toBeInTheDocument();
        expect(screen.getByText(/Status:/i)).toBeInTheDocument();
        expect(screen.getByText('ok')).toBeInTheDocument();
        expect(screen.getByText(/Service is running/i)).toBeInTheDocument();
    });

    it('handles fetch errors gracefully (logs error)', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch.mockRejectedValue(new Error('Network error'));

        render(<App />);

        // Wait for the error to be logged
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching health check:', expect.any(Error));
        });

        // The UI should arguably still show loading or an error state. 
        // Based on current implementation, it stays in loading state.
        expect(screen.getByText(/Loading backend status.../i)).toBeInTheDocument();
        
        consoleSpy.mockRestore();
    });
});

