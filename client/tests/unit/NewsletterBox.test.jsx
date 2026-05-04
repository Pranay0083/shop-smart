import React from 'react';
import { render, screen } from '@testing-library/react';
import NewsletterBox from '../../src/components/NewsletterBox';

describe('NewsletterBox Component', () => {
  it('renders newsletter subscription form', () => {
    render(<NewsletterBox />);
    
    expect(screen.getByText('Subscribe now & get 20% off')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SUBSCRIBE/i })).toBeInTheDocument();
  });
});
