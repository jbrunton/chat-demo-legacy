import { Header } from "./Header";

type LayoutProps = {
  children: React.ReactNode;
  subTitle?: string;
};

export default function Layout({ children, subTitle }: LayoutProps) {
  return (
    <>
      <Header subTitle={subTitle} />
      {children}
    </>
  );
}
