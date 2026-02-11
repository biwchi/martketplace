import { err, ok, type Result } from 'neverthrow';

/**
 * EAV attribute data types. Category-specific; used for filtering and display.
 * Product attribute values (on Product) use keys matching CategoryAttribute.code.
 */
export type CategoryAttributeDataType =
  | "string"
  | "number"
  | "color"
  | "select"
  | "boolean";

export interface CategoryAttributeProps {
  id: number;
  categoryId: number;
  /** Stable identifier for the attribute (key for product attribute values). */
  code: string;
  /** Human-readable name for the attribute (e.g. eng). */
  name: string;
  dataType: CategoryAttributeDataType;
  /** For dataType === "select", the allowed option values */
  isRequired: boolean;
  options?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AttributeValueValidationErrorReason =
  | "invalid-data-type"
  | "required-value-missing"
  | "option-value-not-allowed"

type AttributeValueValidationResult = Result<void, AttributeValueValidationErrorReason>

export class CategoryAttribute {
  public readonly id: number;
  public readonly categoryId: number;
  public readonly code: string;
  public readonly name: string;
  public readonly dataType: CategoryAttributeDataType;
  public readonly options: readonly string[];
  public readonly isRequired: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: CategoryAttributeProps) {
    this.id = props.id;
    this.categoryId = props.categoryId;
    this.code = props.code;
    this.isRequired = props.isRequired;
    this.name = props.name;
    this.dataType = props.dataType;
    this.options = Object.freeze(props.options ?? []);
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CategoryAttributeProps): CategoryAttribute {
    if (props.code.trim().length === 0) {
      throw new Error("CategoryAttribute code must not be empty");
    }
    if (props.name.trim().length === 0) {
      throw new Error("CategoryAttribute name must not be empty");
    }
    if (props.dataType === "select" && (!props.options || props.options.length === 0)) {
      throw new Error("CategoryAttribute of type select must have at least one option");
    }

    return new CategoryAttribute(props);
  }

  public isValidValue(value: unknown): AttributeValueValidationResult {
    const requiredValidation = this.validateRequired(value);
    if (requiredValidation.isErr()) {
      return requiredValidation;
    }

    const typeValidation = this.validateType(value);
    if (typeValidation.isErr()) {
      return typeValidation;
    }

    const selectValidation = this.validateSelect(value);
    if (selectValidation.isErr()) {
      return selectValidation;
    }

    return ok(void 0);
  }

  private isSelect(): boolean {
    return this.dataType === "select";
  }

  private isStringDataTypeValueRequired(): boolean {
    return [
      this.dataType === "string",
      this.isSelect(),
      this.dataType === "color",
    ].some(Boolean);
  }

  private isValidColorValue(value: string): boolean {
    return /^#([0-9a-fA-F]{6})$/.test(value);
  }

  private validateRequired(value: unknown): AttributeValueValidationResult {
    if (!value) {
      return this.isRequired
        ? err("required-value-missing")
        : ok(void 0);
    }

    return ok(void 0);
  }

  private validateType(value: unknown): AttributeValueValidationResult {
    if (this.isStringDataTypeValueRequired()) {
      if (typeof value !== "string") {
        return err("invalid-data-type");
      }

      if (this.dataType === "color" && !this.isValidColorValue(value)) {
        return err("invalid-data-type");
      }
    }
    else if (this.dataType === "number") {
      if (typeof value !== "number") {
        return err("invalid-data-type");
      }
    }
    else if (this.dataType === "boolean") {
      if (typeof value !== "boolean") {
        return err("invalid-data-type");
      }
    }

    return ok(void 0);
  }

  private validateSelect(value: unknown): AttributeValueValidationResult {
    if (!this.isSelect()) {
      return ok(void 0);
    }

    if (typeof value !== "string" || !this.options.includes(value)) {
      return err("option-value-not-allowed");
    }

    return ok(void 0);
  }
}
