import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export function usePollData<T>(
  endpoint: string,
  initial: T,
  frequency?: number
) {
  // Stored data
  const [data, setData] = useState<T>(initial);
  // Time since last checked
  const [lastChecked, setLastChecked] = useState<number>(0);

  /**
   * Call backend, collect some generic data, set data
   */
  const collectData = useCallback(async (): Promise<void> => {
    try {
      // Collect data
      const { data: newData }: { data: T } = await axios.get(endpoint);
      // Update data
      setData(newData);
    } catch (e) {
      // If known error
      if (e instanceof Error) {
        // Log message
        console.error(e.message);
      } else {
        // Else, log full object
        console.error(e);
      }
    }
  }, [endpoint]);

  /**
   * Collect data at some interval
   */
  useEffect(() => {
    /**
     * Collection execution function
     */
    async function execute(): Promise<void> {
      await collectData();
      setLastChecked(0);
    }

    // If some update frequency exists
    if (frequency) {
      // Execute at set frequency
      const executeInterval = setInterval(() => execute(), frequency);
      // Increment lastChecked
      const checkInterval = setInterval(
        () => setLastChecked((previous) => previous + 1),
        1 * 1000 // Every second
      );

      // On dismount
      return () => {
        // Clear intervals
        clearInterval(executeInterval);
        clearInterval(checkInterval);
      };
    }
  }, [collectData, frequency]);

  return { data, lastChecked };
}
