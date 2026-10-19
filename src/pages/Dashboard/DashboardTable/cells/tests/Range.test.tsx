import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Range } from '../Range';

describe('Range', () => {
  it('renders remaining and total range and a percentage indicator', () => {
    render(<Range totalRange={200} rangeLeft={100} />);

    expect(screen.getByText('Range: 100 of 200 km')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('uses the critical color when remaining range is below 30 percent', () => {
    const { container } = render(<Range totalRange={200} rangeLeft={40} />);

    expect(container.querySelector('.rangeRow .iconRow')).toHaveClass('iconRed');
  });
});
