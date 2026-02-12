import { setupHttp } from '@infrastructure/http'
import { configureContainer } from './container'
import { Login, Logout, RefreshAuthToken, Signup } from '@application/auth'

const port = Bun.env.PORT ? Number(Bun.env.PORT) : 3000

export const bootstrap = async () => {
  const container = configureContainer()

  const { get } = container

  setupHttp({
    port,
    dependencies: {
      login: get(Login),
      signup: get(Signup),
      logout: get(Logout),
      refreshToken: get(RefreshAuthToken),
    }
  })
}