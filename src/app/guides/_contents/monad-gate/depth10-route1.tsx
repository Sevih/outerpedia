import { nodes, edges, routeTitle } from "@/data/monad/depth10-route1";
import { nodeTypes } from "@/lib/monad/nodeTypes";
import MonadGateMap from "@/app/components/guides/MonadGateMap";
import MonadIncompleteNotice from "@/app/components/guides/MonadIncompleteNotice";

const Deeps8Route2 = () => (
  <div className="space-y-4">
    <MonadIncompleteNotice />
    <MonadGateMap
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      title={routeTitle}
    />
  </div>
);

export default Deeps8Route2;
