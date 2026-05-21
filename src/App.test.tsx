import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CINEWAVE heading', async () => {
  render(<App />);
  const headingElement = await screen.findByText(/CINEWAVE/i);
  expect(headingElement).toBeInTheDocument();
});
