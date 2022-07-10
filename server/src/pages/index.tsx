import type { NextPage } from "next";
import Layout from "@app/components/Layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <></>
    </Layout>
  );
};

Home.requireAuth = false;

export default Home;
