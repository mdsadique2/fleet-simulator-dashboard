import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateTime } from '../DateTime';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('DateTime', () => {
  it('renders event and received timestamps with directional icons', () => {
    vi.spyOn(Date.prototype, 'toLocaleString')
      .mockReturnValueOnce('Event timestamp')
      .mockReturnValueOnce('Received timestamp');

    const { container } = render(
      <DateTime
        row={{
          eventTime: '2026-01-01T10:00:00.000Z',
          signalReceived: '2026-01-01T10:00:01.000Z',
        }}
      />
    );

    expect(screen.getByText('Event timestamp')).toBeInTheDocument();
    expect(screen.getByText('Received timestamp')).toBeInTheDocument();
    expect(screen.getAllByTestId('icon-arrow')).toHaveLength(2);
    expect(container.querySelector('.received')).toHaveClass('rotate180');
  });
});
