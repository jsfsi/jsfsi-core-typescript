export class Failure {
  public readonly name: string;

  constructor() {
    this.name = this.constructor.name;
  }
}
