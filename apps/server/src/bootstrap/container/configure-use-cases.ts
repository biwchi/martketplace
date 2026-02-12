import { Login, Logout, RefreshAuthToken, Signup } from '@application/auth';
import { container } from 'bootstrap/container';

export function configureUseCases() {
  container.bind(Login).toSelf().inSingletonScope();
  container.bind(Signup).toSelf().inSingletonScope();
  container.bind(Logout).toSelf().inSingletonScope();
  container.bind(RefreshAuthToken).toSelf().inSingletonScope();
}