import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Speed } from '../Speed';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

describe('Speed', () => {
  it('renders the low-speed icon and normal color at the threshold', () => {
    const { container } = render(<Speed speed={70} />);

    expect(screen.getByTestId('icon-speed-low')).toBeInTheDocument();
    expect(container.querySelector('.iconRow')).toHaveClass('iconOrange');
    expect(screen.getByText('70 km/h')).toBeInTheDocument();
  });

  it('renders the high-speed icon and critical color above the threshold', () => {
    const { container } = render(<Speed speed={71} />);

    expect(screen.getByTestId('icon-speed-high')).toBeInTheDocument();
    expect(container.querySelector('.iconRow')).toHaveClass('iconRed');
    expect(screen.getByText('71 km/h')).toBeInTheDocument();
  });
});
