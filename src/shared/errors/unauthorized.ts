export class Unauthorized extends Error {
  constructor() {
    super();
    this.message = "User is not authorized";
    this.name = "Unauthorized";
  }
}
