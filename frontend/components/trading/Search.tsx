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

export default function Search() {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<unknown[]>([]);

  const handleSearch = () => {};

  return (
    <Card title="Friend Search">
      <div className="p-2 pt-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {/* Trigger button */}
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label={""}
              className="w-full justify-between"
            >
              Test
              <ChevronDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          {/* Popover menu */}
          <PopoverContent className="p-0">
            <Command>
              <CommandInput
                placeholder="Search friends"
                value={search}
                onValueChange={handleSearch}
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
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}
