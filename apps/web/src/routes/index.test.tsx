import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IndexPage } from './index';

describe('IndexPage', () => {
  it('renders the project title', () => {
    render(<IndexPage />);
    expect(screen.getByText('OKX Crypto Portfolio')).toBeDefined();
  });
});
