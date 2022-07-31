import AppLayout from "@app/components/Layout";
import { AuthEmail, EmailDB } from "@data/low/email-db";
import { LowEmailRepository } from "@data/low/email-repository";
import { Button, Result } from "antd";
import { GetServerSideProps } from "next";

export default function VerifyRequestPage({ email }: { email: AuthEmail }) {
  const extra = (
    <>
      {email.previewUrl ? (
        <Button target={"_blank"} href={email.previewUrl}>
          Preview
        </Button>
      ) : null}
      <Button href={email.verificationUrl}>Sign In as {email.to}</Button>
    </>
  );
  return (
    <AppLayout>
      <Result title="An email has been sent" extra={extra} />
    </AppLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const emailDB = EmailDB.createFileSystemDB();
  const emailRepo = new LowEmailRepository(emailDB);
  const email = await emailRepo.getRecentEmail();
  return {
    props: {
      email,
    },
  };
};
