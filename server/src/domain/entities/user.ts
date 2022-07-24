export interface User {
  id: string;
  name: string;
}

export interface UserRepository {
  rename(userId: string, newName: string): Promise<User>;
}
