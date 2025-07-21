import { InputHTMLAttributes } from 'react';
import { FieldError, FieldValues, Path, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input } from '../../input';
import { cn } from '../../utils';

type FormInputProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  placeholder?: string;
  required?: boolean;
  children?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function ErrorMessage({ children }: { children: string }) {
  return (
    <p data-slot="form-message" className={cn('text-destructive text-sm')}>
      {children}
    </p>
  );
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  placeholder,
  required = false,
  ...rest
}: FormInputProps<TFieldValues>) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name] as FieldError | undefined;

  return (
    <div className={cn('grid gap-2')}>
      <Input
        {...rest}
        {...register(name)}
        name={name}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
      />
      <ErrorMessage>{error ? t(error.message) : ''}</ErrorMessage>
    </div>
  );
}
