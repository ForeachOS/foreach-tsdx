import * as React from 'react';
import { render } from '@testing-library/react';
import { Thing } from '.';

describe('it', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Thing />);
    expect(getByText('the snozzberries taste like snozzberries'));
  });
});
