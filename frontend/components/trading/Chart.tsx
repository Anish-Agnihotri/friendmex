import { useState } from "react";
import Card from "components/Card";
import { Global } from "state/global";

export default function Chart() {
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  // Token address
  const { address }: { address: string } = Global.useContainer();

  return (
    <Card title="Token Chart">
      <div>
        <span>Test</span>
      </div>
    </Card>
  );
}
