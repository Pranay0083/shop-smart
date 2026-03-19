import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
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

  it('should show error message when products API fails', async () => {
    server.use(
      http.get('*/api/products', () =>
        HttpResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/Could not load products right now/i)).toBeInTheDocument();
  });

  it('should show error when navigating to a non-existent product', async () => {
    render(
      <MemoryRouter initialEntries={['/products/does-not-exist']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should show loading state while products are being fetched', async () => {
    // Create a deferred promise BEFORE registering the handler so the resolver
    // is guaranteed to be in scope when called from outside the handler.
    let resolveProducts;
    const blocker = new Promise((resolve) => {
      resolveProducts = () =>
        resolve(
          HttpResponse.json({
            success: true,
            data: { products: [] }
          })
        );
    });

    server.use(
      http.get('*/api/products', () => blocker)
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Loading text should be visible while the promise is still pending
    expect(screen.getByText(/Loading products/i)).toBeInTheDocument();

    // Unblock the handler
    resolveProducts();

    await waitFor(() => {
      expect(screen.queryByText(/Loading products/i)).not.toBeInTheDocument();
    });
  });

  it('should render product price formatted with 2 decimal places', async () => {
    render(
      <MemoryRouter initialEntries={['/products/p-101']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Price 79.99 should display as $79.99
      expect(screen.getByText('$79.99')).toBeInTheDocument();
    });
  });

  it('should show Add to Cart and Save for Later buttons on product detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/products/p-101']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    expect(screen.getByText('Save for Later')).toBeInTheDocument();
  });
});
