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

const UserNamePasswordSchema = z
  .object({
    email: z.email({ error: i18n.t('signup.errors.emailInvalid') }),
    password: z.string().min(1, {
      error: i18n.t('signup.errors.passwordRequired'),
    }),
    confirmPassword: z.string().min(1, {
      error: i18n.t('signup.errors.confirmPasswordRequired'),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18n.t('signup.errors.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });
type UserNamePassword = z.infer<typeof UserNamePasswordSchema>;

function UserNamePasswordForm() {
  const { t } = useTranslation();
  const { signUpWithEmailAndPassword } = useAuth();
  const navigate = useNavigate();
  const { reportFailure } = useCrashlytics();

  const [isSigningUp, setIsSigningUp] = useState(false);

  const onSignUp = async (data: UserNamePassword) => {
    setIsSigningUp(true);

    const [, failure] = await signUpWithEmailAndPassword({
      email: data.email,
      password: data.password,
    });

    if (isFailure(Failure)(failure)) {
      reportFailure('Failed to sign up', failure);
      toast.error(t('signup.errors.usernamePasswordFailed'));
    } else {
      toast.success(t('signup.success'));
      navigate('/');
    }

    setIsSigningUp(false);
  };

  return (
    <Form onSubmit={onSignUp} resolver={zodResolver(UserNamePasswordSchema)}>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t('signup.email')}</Label>
          <FormInput name="email" placeholder={t('signup.emailPlaceholder')} type="email" />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">{t('login.password')}</Label>
          </div>
          <FormInput name="password" type="password" placeholder={t('login.password')} />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
          </div>
          <FormInput
            name="confirmPassword"
            type="password"
            placeholder={t('signup.confirmPassword')}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSigningUp}>
          {isSigningUp ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t('signup.submitWithUsernameAndPassword')
          )}
        </Button>
      </div>
    </Form>
  );
}

function SignUpWithGoogle() {
  const { t } = useTranslation();
  const { signUp } = useAuth();

  const navigate = useNavigate();
  const { reportFailure } = useCrashlytics();

  const [isSigningUp, setIsSigningUp] = useState(false);

  const onSignUp = async () => {
    setIsSigningUp(true);

    const [, failure] = await signUp();

    if (isFailure(Failure)(failure)) {
      reportFailure('Failed to sign up', failure);
      toast.error(t('signup.errors.googleFailed'));
    } else {
      toast.success(t('signup.success'));
      navigate('/');
    }

    setIsSigningUp(false);
  };

  return (
    <Button variant="outline" className="w-full" disabled={isSigningUp} onClick={onSignUp}>
      <img src="/google-icon.svg" alt="Google" className="size-4" />
      {isSigningUp ? <Loader2 className="size-4 animate-spin" /> : t('signup.submitWithGoogle')}
    </Button>
  );
}

export function SignupForm({ className }: React.ComponentProps<'form'>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('signup.title')}</h1>
        <p className="text-muted-foreground text-sm text-balance">{t('signup.description')}</p>
      </div>
      <div className="grid gap-6">
        <UserNamePasswordForm />
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {t('signup.orContinueWith')}
          </span>
        </div>
        <SignUpWithGoogle />
      </div>
      <div className="text-center text-sm">
        {t('signup.alreadyHaveAccount')}{' '}
        <a
          className="cursor-pointer underline underline-offset-4"
          onClick={() => navigate('/login')}
        >
          {t('signup.signIn')}
        </a>
      </div>
    </div>
  );
}
