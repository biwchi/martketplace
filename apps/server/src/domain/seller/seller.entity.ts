/**
 * Seller (shop) account status: whether the seller can list and sell products.
 */
export type SellerStatus = 'pending' | 'active' | 'suspended'

export interface SellerProps {
  id: number
  userId: number
  name: string
  /** Shop/seller account status (e.g. pending approval, active, suspended) */
  status: SellerStatus
  createdAt: Date
  updatedAt: Date
}

export class Seller {
  public readonly id: number
  public readonly userId: number
  public readonly name: string
  public readonly status: SellerStatus
  public readonly createdAt: Date
  public readonly updatedAt: Date

  private constructor(props: SellerProps) {
    this.id = props.id
    this.userId = props.userId
    this.name = props.name
    this.status = props.status
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: SellerProps): Seller {
    if (props.name.trim().length === 0) {
      throw new Error('Seller shop name must not be empty')
    }

    return new Seller(props)
  }

  get canSell(): boolean {
    return this.status === 'active'
  }
}
