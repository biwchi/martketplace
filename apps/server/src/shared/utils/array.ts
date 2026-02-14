export function uniqueBy<T>(keyFn: (item: T) => unknown, items: T[]): T[] {
  const map = new Map<unknown, T>()

  for (const item of items) {
    const key = keyFn(item)
    if (!map.has(key)) {
      map.set(key, item)
    }
  }

  return Array.from(map.values())
}
