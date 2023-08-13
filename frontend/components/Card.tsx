import { ReactElement } from "react";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";

export default function Card({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactElement | ReactElement[];
}) {
  return (
    // Card component
    <div className="flex flex-col bg-white border-[1px] border-bitmex-strong-border h-full">
      {/* Card header */}
      <div className="flex items-center justify-between bg-bitmex-strong py-0.5">
        {/* Card header: left */}
        <div className="flex items-center">
          {/* Resizer */}
          <div className="drag-handle">
            <DragHandleDots2Icon className="text-zinc-500" />
          </div>

          {/* Component title */}
          <span className="pl-1 text-sm font-bold">{title}</span>
        </div>

        {/* Card header: right */}
        {updated && (
          <span className="text-zinc-500 text-xs font-light pr-2">
            {updated}
          </span>
        )}
      </div>

      {/* Card content */}
      <div className="bg-bitmex-widget overflow-auto flex-1">{children}</div>
    </div>
  );
}
