import { User } from "@domain/entities/user";
import { addDays, subDays } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { MockReqDependencies } from "./dependencies";

export const stubSession =
  (session: Session) =>
  ({ sessionRepository, ...deps }: MockReqDependencies) => {
    sessionRepository.getSession.mockResolvedValue(session);
    return { sessionRepository, ...deps };
  };

export const stubAdapterUser =
  (userId: string, adapterUser: AdapterUser) =>
  ({ adapter, ...deps }: MockReqDependencies) => {
    adapter.getUser.calledWith(userId).mockResolvedValue(adapterUser);
    return { adapter, ...deps };
  };

export const stubAuth =
  (user: User) =>
  ({ sessionRepository, adapter, ...deps }: MockReqDependencies) => {
    const adapterUser: AdapterUser = {
      ...user,
      emailVerified: subDays(new Date(), 30),
    };

    const session: Session = {
      user,
      expires: addDays(new Date(), 30).toISOString(),
    };

    return pipe(
      { sessionRepository, adapter, ...deps },
      stubSession(session),
      stubAdapterUser(user.id, adapterUser)
    );
  };
