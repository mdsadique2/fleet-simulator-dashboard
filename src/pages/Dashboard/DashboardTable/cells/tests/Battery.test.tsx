import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Battery } from '../Battery';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

describe('Battery', () => {
  it.each([
    [10, 'icon-battery-alert', 'iconRed'],
    [25, 'icon-battery-20', 'iconRed'],
    [35, 'icon-battery-40', 'iconOrange'],
    [50, 'icon-battery-60', 'iconGreen'],
    [70, 'icon-battery-80', 'iconGreen'],
    [90, 'icon-battery-full', 'iconGreen'],
  ])('renders the correct battery indicator for %i%% charge', (soc, icon, color) => {
    const { container } = render(<Battery soc={soc} />);

    expect(screen.getByTestId(icon)).toBeInTheDocument();
    expect(container.querySelector('.iconRow')).toHaveClass(color);
    expect(screen.getByText(`${soc}%`)).toBeInTheDocument();
  });
});
