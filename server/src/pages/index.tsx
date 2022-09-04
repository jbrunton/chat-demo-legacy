import type { NextPage } from "next";
import PageLayout from "@app/components/PageLayout";

const Home: NextPage = () => {
  return (
    <PageLayout showMenu={true}>
      <></>
    </PageLayout>
  );
};

Home.requireAuth = false;

export default Home;
