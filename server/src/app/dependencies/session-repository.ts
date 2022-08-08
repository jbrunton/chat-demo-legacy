import { authOptions } from "@pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";

export interface SessionRepository {
  getSession(): Promise<Session | null>;
}

export const NextSessionRepository = (
  req: NextApiRequest,
  res: NextApiResponse
): SessionRepository => {
  return {
    getSession() {
      return unstable_getServerSession(req, res, authOptions);
    },
  };
};
