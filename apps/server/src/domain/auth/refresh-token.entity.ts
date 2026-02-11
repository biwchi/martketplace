export interface RefreshTokenProps {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UpdateRefreshTokenProps extends Partial<Pick<RefreshTokenProps, "id" | "tokenHash" | "expiresAt">> { }


function validateExpiry(expiresAt: Date): void {
  if (expiresAt <= new Date()) {
    throw new Error("Refresh token expiry must be in the future");
  }
}

export class RefreshToken {
  public readonly id: number;
  public readonly userId: number;
  public readonly tokenHash: string;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;

  private constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  static create(props: RefreshTokenProps): RefreshToken {
    validateExpiry(props.expiresAt);

    return new RefreshToken(props);
  }

  public update(props: UpdateRefreshTokenProps): RefreshToken {
    if (props.expiresAt) {
      validateExpiry(props.expiresAt);
    }

    return RefreshToken.create({
      ...this,
      id: props.id ?? this.id,
      tokenHash: props.tokenHash ?? this.tokenHash,
      expiresAt: props.expiresAt ?? this.expiresAt,
    });
  }

  get isExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }
}
