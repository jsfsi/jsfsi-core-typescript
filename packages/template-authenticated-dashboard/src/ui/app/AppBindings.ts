import { AuthenticationAdapter } from '../../adapters/AuthenticationAdapter/AuthenticationAdapter';
import { FirebaseClient } from '../../adapters/FirebaseClient/FirebaseClient';
import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { BindingType } from '../components/ioc/IoCContextProvider';

/* c8 ignore start */
const adapters: readonly BindingType<unknown>[] = [
  {
    type: FirebaseClient,
    // NOTE: This is a singleton to ensure that the firebase app is only initialized once
    instance: new FirebaseClient().initialize(),
  },
  {
    type: AuthenticationAdapter,
    dynamicValue: (context) => {
      const firebaseClient = context.get(FirebaseClient);
      return new AuthenticationAdapter(firebaseClient);
    },
  },
];

const services: readonly BindingType<unknown>[] = [
  {
    type: AuthenticationService,
    dynamicValue: (context) => {
      const authenticationAdapter = context.get(AuthenticationAdapter);
      return new AuthenticationService(authenticationAdapter);
    },
  },
];

export const AppBindings: readonly BindingType<unknown>[] = [...services, ...adapters];
/* c8 ignore end */
