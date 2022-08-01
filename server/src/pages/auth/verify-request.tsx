import AppLayout from "@app/components/Layout";
import { AppDependencies, withDefaultDeps } from "@app/dependencies";
import { AuditLogEntry } from "@domain/entities/audit-log";
import { DependencyReaderTask } from "@domain/usecases/dependencies";
import { Button, Result } from "antd";
import { GetServerSideProps } from "next";

export default function VerifyRequestPage({
  meta,
}: {
  meta: Record<string, string>;
}) {
  const extra = (
    <>
      {meta.previewUrl ? (
        <Button target={"_blank"} href={meta.previewUrl}>
          Preview
        </Button>
      ) : null}
      <Button href={meta.verificationUrl}>Sign In as {meta.to}</Button>
    </>
  );
  return (
    <AppLayout>
      <Result title="An email has been sent" extra={extra} />
    </AppLayout>
  );
}

const getRecentRequestEntry =
  (): DependencyReaderTask<AuditLogEntry | null, AppDependencies> =>
  ({ auditLogRepository }) =>
  () => {
    return auditLogRepository.getRecentEntry("verification-request");
  };

export const getServerSideProps: GetServerSideProps = async () => {
  const entry = await withDefaultDeps().run(getRecentRequestEntry());
  const meta = entry && entry.meta ? JSON.parse(entry.meta) : {};
  return {
    props: {
      meta,
    },
  };
};
