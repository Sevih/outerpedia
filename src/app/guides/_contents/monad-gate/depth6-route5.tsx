'use client';

import { nodes, edges, routeTitleKey } from "@/data/monad/depth6-route5";
import { nodeTypes } from "@/lib/monad/nodeTypes";
import MonadGateMap from "@/app/components/guides/MonadGateMap";
import ItemInlineDisplay from "@/app/components/ItemInline";
import { useI18n } from "@/lib/contexts/I18nContext";

const Depth6Route5 = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">{t('monad.rewards')}</h3>
        <div className="flex items-center gap-2">
          <ItemInlineDisplay names="Fusion-Type Core" size={32} />
          <span className="text-zinc-400">x150</span>
        </div>
      </div>
      <MonadGateMap
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        titleKey={routeTitleKey}
      />
    </div>
  );
};

export default Depth6Route5;
