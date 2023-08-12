import { ReactElement } from "react";

export default function Card({
  title,
  children,
}: {
  title: string;
  children: ReactElement | ReactElement[];
}) {
  return (
    <div className="flex flex-col bg-white border-[1px] border-bitmex-strong-border h-full">
      <div className="bg-bitmex-strong px-2 py-0.5">
        <span className="text-sm font-bold">{title}</span>
      </div>
      <div className="bg-bitmex-widget overflow-auto flex-1">{children}</div>
    </div>
  );
}
