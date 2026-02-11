export interface PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean>;
  hash(plain: string): Promise<string>;
}

export const PASSWORD_HASHER_PORT_TOKEN = Symbol.for("PasswordHasherPort");

