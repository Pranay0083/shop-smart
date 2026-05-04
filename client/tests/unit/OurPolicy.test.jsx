import React from 'react';
import { render, screen } from '@testing-library/react';
import OurPolicy from '../../src/components/OurPolicy';

describe('OurPolicy Component', () => {
  it('renders policy information', () => {
    render(<OurPolicy />);
    
    expect(screen.getByText('Easy Exchange Policy')).toBeInTheDocument();
    expect(screen.getByText('7 Days Return Policy')).toBeInTheDocument();
    expect(screen.getByText('Best customer support')).toBeInTheDocument();
  });
});
