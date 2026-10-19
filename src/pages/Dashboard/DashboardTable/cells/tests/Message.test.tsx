import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Message } from '../Message';

describe('Message', () => {
  it('renders each semicolon-separated message in uppercase', () => {
    render(
      <Message
        message="Battery low; urgent attention"
        row={{ vehicle_id: 'vehicle-1', status: 'critical' }}
      />
    );

    expect(screen.getByText('BATTERY LOW')).toBeInTheDocument();
    expect(screen.getByText('URGENT ATTENTION')).toBeInTheDocument();
  });

  it.each([
    ['normal', 'green'],
    ['moderate', 'orange'],
    ['critical', 'red'],
  ])('uses the %s status color', (status, color) => {
    const { container } = render(
      <Message message="Status message" row={{ vehicle_id: 'v1', status }} />
    );

    expect(container.querySelector('.ant-tag')).toHaveClass(`ant-tag-${color}`);
  });
});
