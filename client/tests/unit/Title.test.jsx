import React from 'react';
import { render, screen } from '@testing-library/react';
import Title from '../../src/components/Title';

describe('Title Component', () => {
  it('renders correctly with given text properties', () => {
    render(<Title text1="Hello" text2="World" />);
    
    // Check if both text parts are rendered in the document
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/World/)).toBeInTheDocument();
  });
});
