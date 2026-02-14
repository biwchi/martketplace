export interface PasswordHasher {
  compare: (plain: string, hash: string) => boolean
  hash: (plain: string) => string
}

export const PASSWORD_HASHER_PORT_TOKEN = Symbol.for('PasswordHasherPort')
