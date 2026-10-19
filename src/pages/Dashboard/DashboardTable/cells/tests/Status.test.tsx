import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Status } from '../Status';

describe('Status', () => {
  it.each([
    ['normal', 'iconGreen'],
    ['moderate', 'iconOrange'],
    ['critical', 'iconRed'],
    ['unknown', 'iconGreen'],
  ])('renders the %s status with class %s', (status, expectedClass) => {
    const { container } = render(<Status status={status} />);
    expect(container.querySelector('.statusCell')).toHaveClass(expectedClass);
  });
});
