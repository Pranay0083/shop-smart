import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../mocks/server';
import { AppRoutes } from '../../App';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

describe('Integration Tests - Product Flow', () => {
  it('should render products on home page from API', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
    });

    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Smart Fitness Watch')).toBeInTheDocument();
  });

  it('should render product details when opening product route', async () => {
    render(
      <MemoryRouter initialEntries={['/products/p-101']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    });

    expect(screen.getByText(/Comfortable over-ear wireless headphones/i)).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
  });
});
