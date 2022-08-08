import { ReqDependencies } from "@app/dependencies";
import { toUser } from "@data/utils";
import { UnauthorisedUser } from "@domain/entities/errors";
import { User } from "@domain/entities/user";
import { DependencyReaderTask } from "@domain/usecases/dependencies";
import { pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";

export type AuthenticateDeps = Pick<
  ReqDependencies,
  "req" | "adapter" | "sessionRepository"
>;

export const authenticate = (): DependencyReaderTask<User, AuthenticateDeps> =>
  pipe(
    RT.ask<AuthenticateDeps>(),
    RT.chain(({ req, adapter, sessionRepository }) =>
      RT.fromTask(async () => {
        const session = await sessionRepository.getSession();
        if (!session) {
          throw new UnauthorisedUser("User must be authenticated");
        }

        const adapterUser = await adapter.getUser(session.user.id);
        if (!adapterUser) {
          throw new UnauthorisedUser("User does not exist");
        }

        const user = toUser(adapterUser);
        req.user = user;

        return user;
      })
    )
  );
