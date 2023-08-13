import axios from "axios";
import Card from "components/Card";
import { Input } from "components/ui/input";
import { renderTimeSince } from "utils/time";
import { usePollData } from "utils/usePollData";
import { useDebounce } from "@uidotdev/usehooks";
import User, { type UserInfo } from "components/User";
import { useState, useCallback, useEffect } from "react";
import { SymbolIcon, CrossCircledIcon } from "@radix-ui/react-icons";

function useSearch(search: string) {
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  // Results
  const [results, setResults] = useState<UserInfo[]>([]);

  /**
   * Collect search results from backend
   */
  const getResults = useCallback(async () => {
    try {
      // Toggle loading
      setLoading(true);

      // Request from backend
      const { data } = await axios.post("/api/token/search", {
        search,
      });
      setResults(data);
    } catch (e: unknown) {
      // If known error
      if (e instanceof Error) {
        // Log message
        console.error(e.message);
      } else {
        // Else, log full object
        console.error(e);
      }
    } finally {
      // Toggle loading
      setLoading(false);
    }
  }, [search]);

  // On search change, call for new data
  useEffect(() => {
    async function execute() {
      await getResults();
    }

    // If no input, set default
    if (search === "") {
      setLoading(false);
      setResults([]);
    } else {
      // Else, process collection
      execute();
    }
  }, [search, getResults]);

  return { results, loading };
}

export default function Leaderboard({
  leaderboard: ssrLeaderboard,
}: {
  leaderboard: any;
}) {
  // Local state
  const [search, setSearch] = useState<string>("");
  // Debounce search input to 150ms
  const debouncedSearch: string = useDebounce(search, 150);
  // Search results
  const { results: searchResults, loading: searchLoading } =
    useSearch(debouncedSearch);

  // Backend data (leaderboard)
  const { data: leaderboard, lastChecked } = usePollData(
    "/api/stats/leaderboard",
    ssrLeaderboard,
    15 * 1000
  );

  return (
    <Card title="Discover" updated={`${renderTimeSince(lastChecked)} ago`}>
      <div className="h-full relative">
        {/* Search users */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="h-8 w-[calc(100%-2px)] fixed focus-visible:ring-0 shadow-none border-l-0 border-r-0 border-t-0 border-b rounded-none bg-zinc-100"
        />

        <div className="pt-11 pb-3 px-3 flex">
          {debouncedSearch !== "" ? (
            // Search exists
            <div className="h-full flex flex-1">
              {searchLoading ? (
                <div className="pt-4 flex flex-col w-full items-center text-zinc-500">
                  <SymbolIcon className="h-8 w-8 animate-spin" />
                  <span className="pt-2 text-sm pr-2">Loading friends...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex w-full flex-col gap-y-3">
                  {searchResults.map((user: UserInfo, i: number) => (
                    <User key={i} data={user} />
                  ))}
                </div>
              ) : (
                <div className="pt-4 flex flex-col w-full items-center text-zinc-500">
                  <CrossCircledIcon className="h-8 w-8" />
                  <span className="pt-2 text-sm pr-2">No results found</span>
                </div>
              )}
            </div>
          ) : (
            // No search, return leaderboard
            <div className="flex w-full flex-col gap-y-3">
              {leaderboard.map((user: UserInfo, i: number) => (
                <User key={i} data={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
