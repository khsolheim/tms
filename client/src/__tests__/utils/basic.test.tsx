import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Enkel test komponent
const TestComponent: React.FC<{ message: string }> = ({ message }) => {
  return <div data-testid="test-message">{message}</div>;
};

describe('Basic Testing Setup', () => {
  it('skal rendre test komponent', () => {
    render(<TestComponent message="Hei verden" />);
    
    const element = screen.getByTestId('test-message');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hei verden');
  });

  it('skal ha Jest og React Testing Library konfigurert', () => {
    expect(true).toBe(true);
  });

  it('skal kunne bruke async/await i tester', async () => {
    const promise = Promise.resolve('test data');
    const result = await promise;
    expect(result).toBe('test data');
  });
}); 