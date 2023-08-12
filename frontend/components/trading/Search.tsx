import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CommandEmpty, CommandGroup, CommandList } from "cmdk";
import Card from "components/Card";
import { Button } from "components/ui/button";
import { Command, CommandInput } from "components/ui/command";
import { useState } from "react";
import { Global } from "state/global";

export default function Search() {
  const [open, setOpen] = useState<boolean>(false);
  const { address, setAddress } = Global.useContainer();
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<unknown[]>([]);

  const handleSearch = () => {};

  return (
    <div className="p-4 z-50 bg-bitmex-strong border-b border-b-bitmex-strong-border">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open}>
            {address}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Command>
            <CommandList>
              <CommandInput
                className="z-50"
                placeholder="Search friends"
                value={search}
                onValueChange={setSearch}
              />

              {results?.length === 0 ? (
                <CommandEmpty>
                  <span>No friends found</span>
                </CommandEmpty>
              ) : (
                <CommandList>
                  <CommandGroup>{/* TODO: */}</CommandGroup>
                </CommandList>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
