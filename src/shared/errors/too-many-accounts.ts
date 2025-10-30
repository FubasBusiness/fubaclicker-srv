export class TooManyAccounts extends Error {
  constructor() {
    super();
    this.message = "Only allowed to have 5 accounts.";
    this.name = "TooManyAccounts";
  }
}
