/**
 * Sentinel value for entity id when the entity has not been persisted yet.
 * Use in domain entities and repository logic; do not use as a real database id.
 */
export const NEW_ENTITY_ID = 0

export function isPersistedEntity(entity: { id: number }): boolean {
  return entity.id !== NEW_ENTITY_ID
}
