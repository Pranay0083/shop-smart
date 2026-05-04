import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../src/components/Footer';

describe('Footer Component', () => {
  it('renders footer content correctly', () => {
    render(<Footer />);
    
    // Check if key text elements are rendered
    expect(screen.getByText('COMPANY')).toBeInTheDocument();
    expect(screen.getByText('GET IN TOUCH')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('contact@foreveryou.com')).toBeInTheDocument();
    expect(screen.getByText(/Copyright 2024@ forever.com/i)).toBeInTheDocument();
  });
});
