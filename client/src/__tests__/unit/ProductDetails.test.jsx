import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetails from '../../pages/ProductDetails';

describe('ProductDetails Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/products/p-101']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading product details...')).toBeInTheDocument();
  });

  it('should render product data when request succeeds', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              product: {
                id: 'p-101',
                name: 'Wireless Headphones',
                category: 'Audio',
                price: 79.99,
                rating: 4.5,
                stock: 24,
                image: 'https://example.com/headphones.jpg',
                description: 'Premium sound for daily listening.'
              }
            }
          })
      })
    );

    render(
      <MemoryRouter initialEntries={['/products/p-101']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    });

    expect(screen.getByText('Premium sound for daily listening.')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
    expect(screen.getByTestId('back-home-link')).toBeInTheDocument();
  });

  it('should render error state when request fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, message: 'Product not found' })
      })
    );

    render(
      <MemoryRouter initialEntries={['/products/unknown']}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Product not found');
    });
  });
});
