import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '../../app/App';

import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('render 404 page', () => {
    const { getByText } = render(
      <MemoryRouter>
        <AppProviders>
          <NotFoundPage />
        </AppProviders>
      </MemoryRouter>,
    );

    expect(getByText('Not Found')).toBeInTheDocument();
  });
});
