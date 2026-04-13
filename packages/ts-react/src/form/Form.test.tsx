import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { Form } from './Form';

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type TestFormData = z.infer<typeof testSchema>;

function FormContent() {
  const { register } = useFormContext<TestFormData>();
  return <input {...register('name')} placeholder="Name" />;
}

describe('Form', () => {
  describe('Render', () => {
    it('renders children inside a form element', () => {
      render(
        <Form resolver={zodResolver(testSchema)}>
          <div>form content</div>
        </Form>,
      );

      expect(screen.getByText('form content')).toBeInTheDocument();
    });

    it('renders with default values', () => {
      render(
        <Form resolver={zodResolver(testSchema)} defaultValues={{ name: 'initial' }}>
          <FormContent />
        </Form>,
      );

      expect(screen.getByPlaceholderText('Name')).toHaveValue('initial');
    });
  });

  describe('Behavior', () => {
    it('calls onSubmit with form data', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();

      render(
        <Form resolver={zodResolver(testSchema)} onSubmit={onSubmit} defaultValues={{ name: '' }}>
          <FormContent />
          <button type="submit">Submit</button>
        </Form>,
      );

      await user.type(screen.getByPlaceholderText('Name'), 'John');
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({ name: 'John' }, expect.anything());
      });
    });

    it('resets form when defaultValues change', () => {
      const { rerender } = render(
        <Form resolver={zodResolver(testSchema)} defaultValues={{ name: 'first' }}>
          <FormContent />
        </Form>,
      );

      expect(screen.getByPlaceholderText('Name')).toHaveValue('first');

      rerender(
        <Form resolver={zodResolver(testSchema)} defaultValues={{ name: 'second' }}>
          <FormContent />
        </Form>,
      );

      expect(screen.getByPlaceholderText('Name')).toHaveValue('second');
    });

    it('does not reset form when defaultValues are deeply equal', () => {
      const { rerender } = render(
        <Form resolver={zodResolver(testSchema)} defaultValues={{ name: 'same' }}>
          <FormContent />
        </Form>,
      );

      rerender(
        <Form resolver={zodResolver(testSchema)} defaultValues={{ name: 'same' }}>
          <FormContent />
        </Form>,
      );

      expect(screen.getByPlaceholderText('Name')).toHaveValue('same');
    });
  });
});
