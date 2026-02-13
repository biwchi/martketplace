import { Login, Logout, RefreshAuthToken, Signup } from '@application/auth';
import {
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  GetPersonalFeed,
  RecalculateDirtyProductsPopularity,
  CreateUserProductEvent,
} from '@application/product';
import { container } from 'bootstrap/container';

export function configureUseCases() {
  // Auth
  container.bind(Login).toSelf().inSingletonScope();
  container.bind(Signup).toSelf().inSingletonScope();
  container.bind(Logout).toSelf().inSingletonScope();
  container.bind(RefreshAuthToken).toSelf().inSingletonScope();

  // Product
  container.bind(CreateProduct).toSelf().inSingletonScope();
  container.bind(UpdateProduct).toSelf().inSingletonScope();
  container.bind(DeleteProduct).toSelf().inSingletonScope();
  container.bind(GetPersonalFeed).toSelf().inSingletonScope();
  container
    .bind(RecalculateDirtyProductsPopularity)
    .toSelf()
    .inSingletonScope();
  container.bind(CreateUserProductEvent).toSelf().inSingletonScope();
}
