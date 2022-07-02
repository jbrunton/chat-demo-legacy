import { Button, PageHeader } from "antd";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "@styles/Home.module.css";

const Home: NextPage = () => {
  const router = useRouter();

  const newRoom = () => {
    router.push(`/rooms/new`);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        className="site-page-header"
        title="ChatDemo"
        extra={[
          <Button key="new-room" type="primary" onClick={newRoom}>
            New Room
          </Button>,
        ]}
      />
    </div>
  );
};

export default Home;
