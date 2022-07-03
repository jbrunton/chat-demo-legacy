import { Button, Dropdown, Menu } from "antd";
import { useSession, signIn, signOut } from "next-auth/react";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

export const SignInButton = () => {
  const { data: session } = useSession();
  if (session) {
    const displayName = session.user?.name || session.user?.email;
    const menu = (
      <Menu
        items={[
          {
            onClick: () => signOut(),
            label: "Sign Out",
            key: "1",
            icon: <LogoutOutlined />,
          },
        ]}
      />
    );
    return (
      <Dropdown overlay={menu}>
        <Button icon={<UserOutlined />}>{displayName}</Button>
      </Dropdown>
    );
  }
  return (
    <Button type="primary" icon={<UserOutlined />} onClick={() => signIn()}>
      Sign In
    </Button>
  );
};
