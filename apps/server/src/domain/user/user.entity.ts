export interface UserProps {
  id: number;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserUpdateProps extends Partial<Pick<UserProps, "id">> { }

export class User {
  public readonly id: number;
  public readonly email: string;
  private _passwordHash: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this._passwordHash = props.passwordHash;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: UserProps): User {
    // Basic invariant: email must look like an email; keep it simple here.
    if (!props.email.includes("@")) {
      throw new Error("Invalid email");
    }

    return new User(props);
  }

  public update(props: UserUpdateProps): User {
    return User.create({
      ...this,
      ...props,
    });
  }

  get passwordHash(): string {
    return this._passwordHash;
  }
}
