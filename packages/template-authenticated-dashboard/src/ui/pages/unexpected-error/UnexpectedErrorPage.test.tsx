import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UnexpectedErrorPage } from './UnexpectedErrorPage';

describe('UnexpectedErrorPage', () => {
  it('renders the error message', () => {
    const { getByText } = render(<UnexpectedErrorPage error={new Error('boom')} />);

    expect(getByText('boom')).toBeInTheDocument();
  });

  it('renders nothing when no error is provided', () => {
    const { container } = render(<UnexpectedErrorPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
