import { dequal } from 'dequal';
import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Resolver, DefaultValues, FieldValues } from 'react-hook-form';

export function Form<TFieldValues extends FieldValues = FieldValues>({
  resolver,
  children,
  onSubmit,
  defaultValues,
}: {
  resolver: Resolver<TFieldValues, unknown>;
  children: React.ReactNode;
  onSubmit?: (data: TFieldValues) => void;
  defaultValues?: DefaultValues<TFieldValues>;
}) {
  const methods = useForm<TFieldValues>({
    resolver,
    defaultValues,
  });

  const previousDefaultValues = useRef<DefaultValues<TFieldValues> | undefined>(undefined);

  useEffect(() => {
    const shouldReset = !dequal(previousDefaultValues.current, defaultValues);
    if (shouldReset) {
      methods.reset(defaultValues);
      previousDefaultValues.current = defaultValues;
    }
  }, [defaultValues, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}
