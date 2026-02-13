import type { MergedUnion } from '@shared/types-hepers';
import { createAuthController } from './controllers/auth';
import { createProductController } from './controllers/product';
import Elysia from 'elysia';
import openapi from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { errorsHandler } from './errors';
import type { JwtPort } from '@application/auth';

const controllerFactories = [
  createAuthController,
  createProductController,
]

type Dependencies = MergedUnion<Parameters<typeof controllerFactories[number]>[number]>

interface SetupHttpConfig {
  port: number
  dependencies: Dependencies
  jwt: JwtPort
}

export type HttpStore = {
  jwt: JwtPort
}

export const setupHttp = (config: SetupHttpConfig) => {
  const { port, dependencies } = config;

  const auth = createAuthController(dependencies)
  const product = createProductController(dependencies)

  const store: HttpStore = {
    jwt: config.jwt,
  }

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
    .state(store)
    .group('/api', app =>
      app
        .use(auth)
        .use(product)
    )
    .listen(port, (server) => {
      console.log(`Server is running on port ${port}`)
      console.log(`Documentation: http://${server.hostname}:${server.port}/openapi`)
    })
};
