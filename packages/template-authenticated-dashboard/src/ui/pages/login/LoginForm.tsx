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

const UserNamePasswordSchema = z.object({
  email: z.email({ error: i18n.t('login.errors.emailInvalid') }),
  password: z.string().min(1, {
    error: i18n.t('login.errors.passwordRequired'),
  }),
});
type UserNamePassword = z.infer<typeof UserNamePasswordSchema>;

function UserNamePasswordForm() {
  const { t } = useTranslation();
  const { signInWithEmailAndPassword } = useAuth();
  const navigate = useNavigate();
  const { reportFailure } = useCrashlytics();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const onSignIn = async (data: UserNamePassword) => {
    setIsSigningIn(true);

    const [, failure] = await signInWithEmailAndPassword(data);

    if (isFailure(Failure)(failure)) {
      reportFailure('Failed to sign in', failure);
      toast.error(t('login.errors.usernamePasswordFailed'));
    } else {
      toast.success(t('login.success'));
      navigate('/');
    }

    setIsSigningIn(false);
  };

  return (
    <Form onSubmit={onSignIn} resolver={zodResolver(UserNamePasswordSchema)}>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t('login.email')}</Label>
          <FormInput name="email" placeholder={t('login.emailPlaceholder')} type="email" />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">{t('login.password')}</Label>
            <a
              className="cursor-pointer ml-auto text-sm underline-offset-4 hover:underline"
              onClick={() => {
                navigate('/login/reset-password');
              }}
            >
              {t('login.forgotPassword')}
            </a>
          </div>
          <FormInput name="password" type="password" placeholder={t('login.password')} />
        </div>
        <Button type="submit" className="w-full" disabled={isSigningIn}>
          {isSigningIn ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t('login.submitWithUsernameAndPassword')
          )}
        </Button>
      </div>
    </Form>
  );
}

function SignInWithGoogle() {
  const { t } = useTranslation();
  const { signIn } = useAuth();

  const navigate = useNavigate();
  const { reportFailure } = useCrashlytics();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const onSignIn = async () => {
    setIsSigningIn(true);

    const [, failure] = await signIn();

    if (isFailure(Failure)(failure)) {
      reportFailure('Failed to sign in', failure);
      toast.error(t('login.errors.googleFailed'));
    } else {
      toast.success(t('login.success'));
      navigate('/');
    }

    setIsSigningIn(false);
  };

  return (
    <Button variant="outline" className="w-full" disabled={isSigningIn} onClick={onSignIn}>
      <img src="/google-icon.svg" alt="Google" className="size-4" />
      {isSigningIn ? <Loader2 className="size-4 animate-spin" /> : t('login.submitWithGoogle')}
    </Button>
  );
}

export function LoginForm({ className }: React.ComponentProps<'form'>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('login.title')}</h1>
        <p className="text-muted-foreground text-sm text-balance">{t('login.description')}</p>
      </div>
      <div className="grid gap-6">
        <UserNamePasswordForm />
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            {t('login.orContinueWith')}
          </span>
        </div>
        <SignInWithGoogle />
      </div>
      <div className="text-center text-sm">
        {t('login.noAccount')}{' '}
        <a
          className="cursor-pointer underline underline-offset-4"
          onClick={() => navigate('/login/signup')}
        >
          {t('login.signUp')}
        </a>
      </div>
    </div>
  );
}
