import { CryptoHasher } from 'bun'

export function hash(value: string): string {
  return new CryptoHasher('sha256').update(value).digest('hex')
}
