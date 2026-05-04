import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../../src/components/Hero';

describe('Hero Component', () => {
  it('renders hero section correctly', () => {
    render(<Hero />);
    
    expect(screen.getByText('OUR BESTSELLERS')).toBeInTheDocument();
    expect(screen.getByText('Latest Arrivals')).toBeInTheDocument();
    expect(screen.getByText('SHOP NOW')).toBeInTheDocument();
  });
});
