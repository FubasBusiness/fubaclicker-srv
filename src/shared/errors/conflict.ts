export class Conflict extends Error {
  constructor(private field: string) {
    super();
    this.message = `This ${field} is already used. Please try another one.`;
    this.name = "Conflict";
  }
}
