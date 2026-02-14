import type { PreferencesProfile } from './preferences-profile.entity'

export interface PreferencesProfileRepository {
  findByUserId: (userId: number) => Promise<PreferencesProfile | null>
  findByVisitorId: (visitorId: string) => Promise<PreferencesProfile | null>
  create: (preferences: PreferencesProfile) => Promise<PreferencesProfile>
  update: (preferences: PreferencesProfile) => Promise<PreferencesProfile>
}

export const PREFERENCES_PROFILE_REPOSITORY_TOKEN = Symbol.for(
  'PreferencesProfileRepository',
)
