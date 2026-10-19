import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Location } from '../Location';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

describe('Location', () => {
  it('renders its icon and longitude/latitude coordinates', () => {
    const { container } = render(<Location long={77.5946} lat={12.9716} />);

    expect(screen.getByTestId('icon-location')).toBeInTheDocument();
    expect(container).toHaveTextContent('77.5946, 12.9716');
  });
});
