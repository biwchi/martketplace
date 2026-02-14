import type { PasswordHasher } from '@application/auth'
import { hash } from './crypto'

export class PasswordHasherAdapter implements PasswordHasher {
  public compare(plain: string, hash: string): boolean {
    return this.hash(plain) === hash
  }

  public hash(plain: string): string {
    return hash(plain)
  }
}
