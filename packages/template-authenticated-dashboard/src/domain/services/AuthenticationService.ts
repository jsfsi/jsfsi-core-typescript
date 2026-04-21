import {
  AuthenticationAdapter,
  type AuthService,
  type EmailPasswordCredentials,
  type User,
} from '@jsfsi-core/ts-react';

export class AuthenticationService implements AuthService<User> {
  constructor(private readonly authenticationAdapter: AuthenticationAdapter<User>) {}

  public onAuthStateChanged(callback: (user: User | null) => void) {
    return this.authenticationAdapter.onAuthStateChanged(callback);
  }

  public signOut() {
    return this.authenticationAdapter.signOut();
  }

  public signIn() {
    return this.authenticationAdapter.signIn();
  }

  public signInWithEmailAndPassword(credentials: EmailPasswordCredentials) {
    return this.authenticationAdapter.signInWithEmailAndPassword(credentials);
  }

  public signUp() {
    return this.authenticationAdapter.signUp();
  }

  public signUpWithEmailAndPassword(credentials: EmailPasswordCredentials) {
    return this.authenticationAdapter.signUpWithEmailAndPassword(credentials);
  }

  public sendPasswordResetEmail(email: string) {
    return this.authenticationAdapter.sendPasswordResetEmail(email);
  }

  public sendEmailVerification() {
    return this.authenticationAdapter.sendEmailVerification();
  }

  public reloadUser() {
    return this.authenticationAdapter.reloadUser();
  }
}
