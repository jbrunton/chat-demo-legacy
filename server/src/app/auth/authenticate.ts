import { ReqDependencies } from "@app/dependencies";
import { toUser } from "@data/utils";
import { UnauthorisedUser } from "@domain/entities/errors";
import { User } from "@domain/entities/user";
import { pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import { ReaderTask } from "fp-ts/ReaderTask";

export const authenticate = (): ReaderTask<ReqDependencies, User> =>
  pipe(
    RT.ask<ReqDependencies>(),
    RT.chain(({ adapter, sessionRepository }) =>
      RT.fromTask(async () => {
        const session = await sessionRepository.getSession();
        if (!session) {
          throw new UnauthorisedUser("User must be authenticated");
        }

        const adapterUser = await adapter.getUser(session.user.id);
        if (!adapterUser) {
          throw new UnauthorisedUser("User does not exist");
        }

        return toUser(adapterUser);
      })
    )
  );
