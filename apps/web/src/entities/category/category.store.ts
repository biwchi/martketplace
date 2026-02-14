import { action, atom } from '@reatom/core'

export class CategoryStore {
  private readonly categories = atom([])

  public getCategoryByName = action((name: string) => {

  })
}
