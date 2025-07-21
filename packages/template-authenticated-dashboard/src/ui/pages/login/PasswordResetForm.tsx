import { zodResolver } from '@hookform/resolvers/zod';
import { Failure, isFailure } from '@jsfsi-core/ts-crossplatform';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../components/auth/AuthContext';
import { Button } from '../../components/button';
import { useCrashlytics } from '../../components/error-boundary/CrashlyticsContext';
import { FormInput } from '../../components/form/elements/FormInput';
import { Form } from '../../components/form/Form';
import { Label } from '../../components/label';
import { cn } from '../../components/utils';
import i18n from '../../i18n/i18n';

const PasswordResetSchema = z.object({
  email: z.email({ error: i18n.t('passwordReset.errors.emailInvalid') }),
});
type PasswordReset = z.infer<typeof PasswordResetSchema>;

export function PasswordResetForm({ className }: React.ComponentProps<'form'>) {
  const { t } = useTranslation();
  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();
  const { reportFailure } = useCrashlytics();

  const [isSending, setIsSending] = useState(false);

  const onSendResetEmail = async (data: PasswordReset) => {
    setIsSending(true);

    const [, failure] = await sendPasswordResetEmail(data.email);

    if (isFailure(Failure)(failure)) {
      reportFailure('Failed to send password reset email', failure);
      toast.error(t('passwordReset.errors.failed'));
    } else {
      toast.success(t('passwordReset.success'));
      navigate('/login');
    }

    setIsSending(false);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('passwordReset.title')}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t('passwordReset.description')}
        </p>
      </div>
      <Form onSubmit={onSendResetEmail} resolver={zodResolver(PasswordResetSchema)}>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">{t('passwordReset.email')}</Label>
            <FormInput
              name="email"
              placeholder={t('passwordReset.emailPlaceholder')}
              type="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? <Loader2 className="size-4 animate-spin" /> : t('passwordReset.submit')}
          </Button>
        </div>
      </Form>
      <div className="text-center text-sm">
        <a
          className="cursor-pointer underline underline-offset-4"
          onClick={() => navigate('/login')}
        >
          {t('passwordReset.backToLogin')}
        </a>
      </div>
    </div>
  );
}
