import {
  AuthenticationAdapter,
  BindingType,
  FirebaseClient,
  type FirebaseConfig,
  type User,
} from '@jsfsi-core/ts-react';

import { configuration } from '../../ConfigurationService';
import { AuthenticationService } from '../../domain/services/AuthenticationService';

/* v8 ignore start -- @preserve */
const firebaseConfig: FirebaseConfig = {
  apiKey: configuration.VITE_FIREBASE_API_KEY,
  authDomain: configuration.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: configuration.VITE_FIREBASE_PROJECT_ID,
  storageBucket: configuration.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: configuration.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: configuration.VITE_FIREBASE_APP_ID,
};

const adapters: readonly BindingType<unknown>[] = [
  {
    type: FirebaseClient,
    // NOTE: This is a singleton to ensure that the firebase app is only initialized once
    instance: new FirebaseClient(firebaseConfig).initialize(),
  },
  {
    type: AuthenticationAdapter,
    dynamicValue: (context) => new AuthenticationAdapter<User>(context.get(FirebaseClient)),
  },
];

const services: readonly BindingType<unknown>[] = [
  {
    type: AuthenticationService,
    dynamicValue: (context) =>
      new AuthenticationService(context.get<AuthenticationAdapter<User>>(AuthenticationAdapter)),
  },
];

export const AppBindings: readonly BindingType<unknown>[] = [...services, ...adapters];
/* v8 ignore end -- @preserve */
