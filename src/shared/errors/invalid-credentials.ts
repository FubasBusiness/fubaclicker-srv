export class InvalidCredentials extends Error {
  constructor() {
    super();
    this.message = "Invalid Credentials";
    this.name = "InvalidCredentials";
  }
}
