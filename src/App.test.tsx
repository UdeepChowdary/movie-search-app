import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the lazy loaded pages to ensure synchronous/fast resolution in testing environment
jest.mock('./pages/Home', () => () => <div>CINEWAVE Home Page</div>);
jest.mock('./pages/MovieDetail', () => () => <div>Movie Detail</div>);

test('renders CINEWAVE heading', async () => {
  render(<App />);
  const headingElement = await screen.findByText(/CINEWAVE/i);
  expect(headingElement).toBeInTheDocument();
});
