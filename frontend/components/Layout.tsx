import Header from "components/Header";
import type { ReactElement } from "react";

export default function Layout({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return (
    <div>
      {/* Header */}
      <Header />

      <div>{children}</div>
    </div>
  );
}
