export interface VisitorProps {
  /**
   * Stable anonymous identifier for a browsing session or device.
   * Always present – used to track behavior before login.
   */
  visitorId: string;
  /**
   * Optional authenticated user id. When present, this visitor is associated
   * with a logged-in user.
   */
  userId?: number;
}

const validateVisitorData = (props: VisitorProps): void => {
  if (!props.visitorId || props.visitorId.trim().length === 0) {
    throw new Error("Visitor visitorId must not be empty");
  }

  if (props.userId !== undefined && props.userId <= 0) {
    throw new Error("Visitor userId must be positive when provided");
  }
};

export class Visitor {
  public readonly visitorId: string;
  public readonly userId?: number;

  private constructor(props: VisitorProps) {
    this.visitorId = props.visitorId;
    this.userId = props.userId;
  }

  static create(props: VisitorProps): Visitor {
    validateVisitorData(props);

    return new Visitor(props);
  }

  get isAuthenticated(): boolean {
    return this.userId !== undefined;
  }
}

