import { AuthEmail, EmailDB } from "./email-db";

export class LowEmailRepository {
  private readonly db: EmailDB;

  constructor(db: EmailDB) {
    this.db = db;
  }

  async recordEmail(email: AuthEmail): Promise<AuthEmail> {
    this.db.createEmail(email);
    return email;
  }

  async getRecentEmail(): Promise<AuthEmail | null> {
    this.db.read();
    const email = this.db.emails
      .sortBy((email) => new Date(email.date))
      .reverse()
      .value()[0];
    return email ?? null;
  }
}
