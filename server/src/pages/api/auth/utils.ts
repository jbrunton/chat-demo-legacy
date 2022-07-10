import { User } from "@domain/entities";
import { AdapterUser } from "next-auth/adapters";

export const toUser = (user: AdapterUser): User => {
  const { id, name } = user;
  if (!name) {
    throw new Error(`Invalid user: ${JSON.stringify(user)}`);
  }
  return { id, name };
};
