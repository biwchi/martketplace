import type { RefreshTokenHasher } from '@application/auth'
import { hash } from './crypto'

export class RefreshTokenHasherAdapter implements RefreshTokenHasher {
  public hash(plain: string): string {
    return hash(plain)
  }
}
