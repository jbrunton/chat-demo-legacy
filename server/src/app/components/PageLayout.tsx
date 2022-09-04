import { getJoinedRooms } from "@app/api/rooms";
import { Room } from "@domain/entities/room";
import { Layout } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Header } from "./Header";
import MenuBar from "./MenuBar";

type LayoutProps = {
  children: React.ReactNode;
  subTitle?: string;
  showMenu?: boolean;
};

export default function PageLayout({
  children,
  subTitle,
  showMenu,
}: LayoutProps) {
  const { data: session } = useSession();

  const [rooms, setRooms] = useState<Room[]>();
  const router = useRouter();

  const loadRooms = async () => {
    const response = await getJoinedRooms();
    setRooms(response.rooms);
  };

  useEffect(() => {
    if (showMenu && session) {
      loadRooms();
    }
  }, [showMenu, session]);

  const onRoomClicked = (room: Room) => router.push(`/rooms/${room.id}`);

  return (
    <>
      <Header subTitle={subTitle} />
      <Layout>
        {showMenu && session ? (
          <Layout.Sider
            width={300}
            style={{ background: "#FFF", paddingRight: 0 }}
          >
            <MenuBar rooms={rooms} onRoomClicked={onRoomClicked} />
          </Layout.Sider>
        ) : null}

        <Layout style={{ padding: "0 24px 24px", background: "#FFF" }}>
          {children}
        </Layout>
      </Layout>
    </>
  );
}
