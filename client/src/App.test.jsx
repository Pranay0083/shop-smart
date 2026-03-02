import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

describe('App', () => {
  beforeEach(() => {
    // Mock fetch for health check
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'ok', message: 'Test Msg', timestamp: 'now' })
      })
    );
    localStorage.clear();
  });

  it('renders ShopSmart title', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    const titleElement = await screen.findByText(/ShopSmart/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders login page on /login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login to ShopSmart/i)).toBeInTheDocument();
  });

  it('renders signup page on /signup route', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
  });
});
