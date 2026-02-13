import "reflect-metadata";

import { setupHttp } from '@infrastructure/http'
import { configureContainer } from './container'
import { JWT_PORT_TOKEN, Login, Logout, RefreshAuthToken, Signup } from '@application/auth'
import {
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  GetPersonalFeed,
  RecalculateDirtyProductsPopularity,
  CreateUserProductEvent,
} from '@application/product'

const port = Bun.env.PORT ? Number(Bun.env.PORT) : 3000

export const bootstrap = async () => {
  const container = configureContainer()

  setupHttp({
    port,
    jwt: container.get(JWT_PORT_TOKEN),
    dependencies: {
      // Auth
      login: container.get(Login),
      signup: container.get(Signup),
      logout: container.get(Logout),
      refreshToken: container.get(RefreshAuthToken),
      // Product
      createProduct: container.get(CreateProduct),
      updateProduct: container.get(UpdateProduct),
      deleteProduct: container.get(DeleteProduct),
      getPersonalFeed: container.get(GetPersonalFeed),
      recalculateDirtyProductsPopularity: container.get(RecalculateDirtyProductsPopularity),
      createUserProductEvent: container.get(CreateUserProductEvent),
    }
  })
}