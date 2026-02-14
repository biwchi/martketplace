type UnionKeys<T> = T extends unknown ? keyof T : never
type UnionValues<T, K extends PropertyKey> = T extends Record<K, infer U> ? U : never

export type MergedUnion<T> = {
  [P in UnionKeys<T>]: UnionValues<T, P>
}
