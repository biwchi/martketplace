import type { MergedUnion } from '@shared/types-hepers';
import { createAuthController } from './controllers/auth';
import Elysia from 'elysia';
import openapi from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { errorsHandler } from './errors';

const controllerFactories = [
  createAuthController
]

type Dependencies = MergedUnion<Parameters<typeof controllerFactories[number]>[number]>

interface SetupHttpConfig {
  port: number
  dependencies: Dependencies
}

export const setupHttp = (config: SetupHttpConfig) => {
  const { port, dependencies } = config;

  const auth = createAuthController(dependencies)

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
    .group('/api', app =>
      app.use(auth)
    )
    .listen(port, (server) => {
      console.log(`Server is running on port ${port}`)
      console.log(`Documentation: http://${server.hostname}:${server.port}/openapi`)
    })
};

