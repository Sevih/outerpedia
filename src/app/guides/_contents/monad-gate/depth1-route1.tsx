import { nodes, edges, routeTitle } from "@/data/monad/depth1-route1";
import { nodeTypes } from "@/lib/monad/nodeTypes";
import MonadGateMap from "@/app/components/guides/MonadGateMap";

const Deeps1Route1 = () => (
  <div className="space-y-4">
    <MonadGateMap
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      title={routeTitle}
    />
  </div>
);

export default Deeps1Route1;
