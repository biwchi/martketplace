import type { JwtPort, PasswordHasher, RefreshTokenHasher } from '@application/auth'
import type { CachePort } from '@application/ports'
import { JWT_PORT_TOKEN, PASSWORD_HASHER_PORT_TOKEN, REFRESH_TOKEN_HASHER_PORT_TOKEN } from '@application/auth'
import { CACHE_PORT_TOKEN } from '@application/ports'
import { JwtAdapter, PasswordHasherAdapter, RefreshTokenHasherAdapter } from '@infrastructure/adapters'
import { RedisCacheAdapter } from '@infrastructure/db/redis/cache.adapter'
import { container } from 'bootstrap/container'

export function configureAdapters() {
  container
    .bind<CachePort>(CACHE_PORT_TOKEN)
    .to(RedisCacheAdapter)
    .inSingletonScope()

  container
    .bind<JwtPort>(JWT_PORT_TOKEN)
    .to(JwtAdapter)
    .inSingletonScope()

  container
    .bind<PasswordHasher>(PASSWORD_HASHER_PORT_TOKEN)
    .to(PasswordHasherAdapter)
    .inSingletonScope()

  container
    .bind<RefreshTokenHasher>(REFRESH_TOKEN_HASHER_PORT_TOKEN)
    .to(RefreshTokenHasherAdapter)
    .inSingletonScope()
}
