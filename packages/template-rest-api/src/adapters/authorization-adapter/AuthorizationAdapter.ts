import { Fail, Ok, Result } from '@jsfsi-core/ts-crossplatform';
import { CustomLogger } from '@jsfsi-core/ts-nestjs';
import { Injectable, Scope } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthError } from 'firebase-admin/lib/utils/error';

import { UnableToValidateUserFailure } from '../../domain/models/UnableToValidateUserFailure';
import { User } from '../../domain/models/User.model';
import { UserAuthorizationExpiredFailure } from '../../domain/models/UserAuthorizationExpiredFailure';

/* v8 ignore if -- @preserve */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

@Injectable({ scope: Scope.DEFAULT })
export class AuthorizationAdapter {
  private readonly logger = new CustomLogger(AuthorizationAdapter.name);

  public async decodeUser({
    rawAuthorization,
  }: {
    rawAuthorization?: string;
  }): Promise<
    Result<User | undefined, UnableToValidateUserFailure | UserAuthorizationExpiredFailure>
  > {
    if (rawAuthorization === undefined) {
      return Ok(undefined);
    }

    if (!rawAuthorization?.startsWith('Bearer ')) {
      this.logger.warn('Invalid authorization header', { rawAuthorization });
      return Fail(new UnableToValidateUserFailure());
    }

    const idToken = rawAuthorization.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);

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
