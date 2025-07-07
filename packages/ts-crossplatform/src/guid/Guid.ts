import * as uuid from 'uuid';

export class Guid {
  private readonly uuid: string;

  constructor(value: string) {
    uuid.parse(value);
    this.uuid = value;
  }

  public toString(): string {
    return this.uuid;
  }

  public equals(other: Guid): boolean {
    return this.uuid === other.toString();
  }

  public static new(): Guid {
    return new Guid(uuid.v4());
  }

  public static empty(): Guid {
    return new Guid(uuid.NIL);
  }

  public static isValid(value?: string | null): boolean {
    return Boolean(value && uuid.validate(value));
  }

  public static parse(value: string): Guid | undefined {
    return value && Guid.isValid(value) ? new Guid(value) : undefined;
  }
}
