import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Stats } from '../Stats';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

describe('Stats', () => {
  it('renders battery, temperature, speed, and range signals from the row', () => {
    render(
      <Stats
        row={{
          payload: {
            signals: {
              soc: 75,
              battery_temp: 35,
              speed: 55,
              total_range_km: 300,
              range_remaining_km: 225,
            },
          },
        }}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('35°C')).toBeInTheDocument();
    expect(screen.getByText('55 km/h')).toBeInTheDocument();
    expect(screen.getByText('Range: 225 of 300 km')).toBeInTheDocument();
  });
});
