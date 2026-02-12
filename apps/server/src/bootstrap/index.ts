import "reflect-metadata";

import { setupHttp } from '@infrastructure/http'
import { configureContainer } from './container'
import { Login, Logout, RefreshAuthToken, Signup } from '@application/auth'

const port = Bun.env.PORT ? Number(Bun.env.PORT) : 3000

export const bootstrap = async () => {
  const container = configureContainer()

  setupHttp({
    port,
    dependencies: {
      login: container.get(Login),
      signup: container.get(Signup),
      logout: container.get(Logout),
      refreshToken: container.get(RefreshAuthToken),
    }
  })
}