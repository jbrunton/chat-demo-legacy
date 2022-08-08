import { User } from "@domain/entities/user";
import { DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: DefaultUser & {
      id: string;
      name: string;
    };
  }
}

declare module "next" {
  interface NextPage {
    requireAuth?: boolean;
  }

  interface NextApiRequest {
    user?: User;
  }
}
