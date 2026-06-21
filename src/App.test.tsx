import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the GreenLens heading brand in the Navbar', () => {
    render(<App />);
    const elements = screen.getAllByText(/GreenLens/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
