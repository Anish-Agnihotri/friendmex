import { DragHandleDots2Icon } from "@radix-ui/react-icons";
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
      <div className="flex items-center bg-bitmex-strong py-0.5">
        <div className="drag-handle">
          <DragHandleDots2Icon className="text-zinc-500" />
        </div>
        <span className="pl-1 text-sm font-bold">{title}</span>
      </div>
      <div className="bg-bitmex-widget overflow-auto flex-1">{children}</div>
    </div>
  );
}
