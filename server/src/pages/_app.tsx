import "@styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import AuthWrapper from "@app/components/AuthWrapper";
import { NextComponentType } from "next";
import { Session } from "next-auth";

type CustomAppProps = AppProps<{ session: Session }> & {
  Component: NextComponentType & { requireAuth?: boolean };
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: CustomAppProps) {
  return (
    <SessionProvider session={session}>
      {Component.requireAuth ? (
        <AuthWrapper>
          <Component {...pageProps} />
        </AuthWrapper>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}
