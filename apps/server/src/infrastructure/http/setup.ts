import type { JwtPort } from '@application/auth'
import type { MergedUnion } from '@shared/types-hepers'
import cors from '@elysiajs/cors'
import openapi from '@elysiajs/openapi'
import Elysia from 'elysia'
import { createAuthController } from './controllers/auth'
import { createProductController } from './controllers/product'
import { errorsHandler } from './errors'

const _controllerFactories = [
  createAuthController,
  createProductController,
]

type Dependencies = MergedUnion<Parameters<typeof _controllerFactories[number]>[number]>

interface SetupHttpConfig {
  port: number
  dependencies: Dependencies
  jwt: JwtPort
}

export interface HttpStore {
  jwt: JwtPort
}

export function setupHttp(config: SetupHttpConfig) {
  const { port, dependencies } = config

  const auth = createAuthController(dependencies)
  const product = createProductController(dependencies)

  return new Elysia()
    .use(openapi({
      documentation: {
        info: {
          title: 'Martketplace API',
          version: '0.0.1',
          description: 'API for the Marketplace app',
        },
      },
    }))
    .use(cors())
    .use(errorsHandler)
    .state({
      jwt: config.jwt,
    } satisfies HttpStore)
    .group('/api', app =>
      app
        .use(auth)
        .use(product))
    .listen(port, (server) => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${port}`)
      // eslint-disable-next-line no-console
      console.log(`Documentation: http://${server.hostname}:${server.port}/openapi`)
    })
}
