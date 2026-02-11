export interface RefreshTokenHasher {
  hash(plain: string): Promise<string>;
}

export const REFRESH_TOKEN_HASHER_PORT_TOKEN = Symbol.for(
  "RefreshTokenHasherPort",
);

