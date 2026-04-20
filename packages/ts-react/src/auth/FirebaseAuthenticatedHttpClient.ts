import { HttpSafeClient } from '@jsfsi-core/ts-crossplatform';

import { FirebaseClient } from './FirebaseClient';

export class FirebaseAuthenticatedHttpClient extends HttpSafeClient {
  constructor(
    private readonly firebaseClient: FirebaseClient,
    baseUrl: string,
  ) {
    super(baseUrl);
  }

  protected async getHeaders(): Promise<Set<[string, string]>> {
    const idToken = await this.firebaseClient.getIdToken();
    const headers = new Set<[string, string]>([['Content-Type', 'application/json']]);
    if (idToken) {
      headers.add(['Authorization', `Bearer ${idToken}`]);
    }
    return headers;
  }
}
