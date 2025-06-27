import { nodes, edges, routeTitle } from "@/data/monad/deeps8-route1";
import { nodeTypes } from "@/lib/monad/nodeTypes";
import MonadGateMap from "@/app/components/guides/MonadGateMap";

const Deeps8Route1 = () => (
  <MonadGateMap nodes={nodes} edges={edges} nodeTypes={nodeTypes} title={routeTitle} />
);

export default Deeps8Route1;
