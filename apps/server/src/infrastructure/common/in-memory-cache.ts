type Key = string | number

export class InMemoryCache<T = unknown> {
  private ttlInSeconds: number
  private storage: Map<Key, {
    expiresAt: Date
    value: T
  }> = new Map()

  constructor(ttlInSeconds = 60 * 20) {
    this.ttlInSeconds = ttlInSeconds
  }

  public get(key: Key) {
    const cached = this.storage.get(key)

    if (!cached) {
      return null
    }

    if (cached.expiresAt.getTime() < Date.now()) {
      this.storage.delete(key)
      return null
    }

    return cached.value
  }

  public set(key: Key, value: T) {
    this.storage.set(key, {
      expiresAt: new Date(Date.now() + this.ttlInSeconds * 1000),
      value,
    })
  }

  public delete(key: Key) {
    this.storage.delete(key)
  }
}
