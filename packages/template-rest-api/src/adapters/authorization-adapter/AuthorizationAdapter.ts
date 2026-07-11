import { Fail, Ok, type Result } from '@jsfsi-core/ts-crossplatform';
import { CustomLogger } from '@jsfsi-core/ts-nestjs';
import { Injectable, Scope } from '@nestjs/common';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { type FirebaseAuthError, getAuth } from 'firebase-admin/auth';

import { UnableToValidateUserFailure } from '../../domain/models/UnableToValidateUserFailure';
import type { User } from '../../domain/models/User.model';
import { UserAuthorizationExpiredFailure } from '../../domain/models/UserAuthorizationExpiredFailure';

/* v8 ignore if -- @preserve */
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

@Injectable({ scope: Scope.DEFAULT })
export class AuthorizationAdapter {
  private readonly logger = new CustomLogger(AuthorizationAdapter.name);

  public async decodeUser({
    rawAuthorization,
  }: {
    rawAuthorization?: string;
  }): Promise<Result<User | undefined, UnableToValidateUserFailure | UserAuthorizationExpiredFailure>> {
    if (rawAuthorization === undefined) {
      return Ok(undefined);
    }

    if (!rawAuthorization?.startsWith('Bearer ')) {
      this.logger.warn('Invalid authorization header', { rawAuthorization });
      return Fail(new UnableToValidateUserFailure());
    }

    const idToken = rawAuthorization.split('Bearer ')[1];

    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);

      const user: User = {
        id: decodedToken.uid,
        email: decodedToken.email,
      };

      return Ok(user);
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;

      if (firebaseError.code === 'auth/id-token-expired') {
        return Fail(new UserAuthorizationExpiredFailure(firebaseError));
      }

      this.logger.warn('Unable to decode firebase token', error);
      return Fail(new UnableToValidateUserFailure(error as Error));
    }
  }
}
