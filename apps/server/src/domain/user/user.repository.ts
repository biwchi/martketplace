import type { User } from './user.entity'

export interface UserRepository {
  findById: (id: number) => Promise<User | null>
  findByEmail: (email: string) => Promise<User | null>
  create: (user: User) => Promise<User>
}

export const USER_REPOSITORY_TOKEN = Symbol.for('UserRepository')
