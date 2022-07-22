import { useSession } from "next-auth/react";
import React, { PropsWithChildren } from "react";

export const SessionContext = React.createContext({
  refreshSession: () => {},
});

const AuthWrapper = ({ children }: PropsWithChildren<{}>) => {
  const refreshSession = () => {
    // See https://github.com/nextauthjs/next-auth/issues/596#issuecomment-943453568
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  const { status } = useSession({
    required: true,
  });

  if (status === "loading") {
    return <>"Loading or not authenticated..."</>;
  }

  return (
    <SessionContext.Provider value={{ refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export default AuthWrapper;
