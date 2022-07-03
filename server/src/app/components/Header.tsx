import { Button, PageHeader } from "antd";
import { useRouter } from "next/router";
import { SignInButton } from "./SignInButton";

type HeaderProps = {
  subTitle?: string;
};

export const Header = ({ subTitle }: HeaderProps) => {
  const router = useRouter();
  const newRoom = () => {
    router.push(`/rooms/new`);
  };
  return (
    <PageHeader
      className="site-page-header"
      title="ChatDemo"
      subTitle={subTitle}
      extra={[
        <Button key="new-room" type="primary" onClick={newRoom}>
          New Room
        </Button>,
        <SignInButton key="sign-in" />,
      ]}
    />
  );
};
