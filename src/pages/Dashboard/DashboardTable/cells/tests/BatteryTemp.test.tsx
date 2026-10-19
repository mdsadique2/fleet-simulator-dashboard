import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BatteryTemp } from '../BatteryTemp';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

describe('BatteryTemp', () => {
  it.each([
    [45, 'icon-thermometer', 'iconGreen'],
    [55, 'icon-thermometer', 'iconGreen'],
    [61, 'icon-thermometer-alert', 'iconRed'],
  ])('renders the temperature indicator at %i°C', (temp, icon, color) => {
    const { container } = render(<BatteryTemp temp={temp} />);

    expect(screen.getByTestId(icon)).toBeInTheDocument();
    expect(container.querySelector('.iconRow')).toHaveClass(color);
    expect(screen.getByText(`${temp}°C`)).toBeInTheDocument();
  });
});
