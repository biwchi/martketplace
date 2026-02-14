export interface RefreshTokenHasher {
  hash: (plain: string) => string
}

export const REFRESH_TOKEN_HASHER_PORT_TOKEN = Symbol.for(
  'RefreshTokenHasherPort',
)
