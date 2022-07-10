import { useSession } from "next-auth/react";
import { PropsWithChildren } from "react";

const AuthWrapper = ({ children }: PropsWithChildren<{}>) => {
  const { status } = useSession({
    required: true,
  });

  if (status === "loading") {
    return <>"Loading or not authenticated..."</>;
  }

  return <>{children}</>;
};

export default AuthWrapper;
