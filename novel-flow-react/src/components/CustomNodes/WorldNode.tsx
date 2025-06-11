import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type WorldNodeData = {
  label: string;
  version: string;
  worldInfo: Record<string, any>;
};

function WorldNode({ id, data }: NodeProps<WorldNodeData>) { // Added id prop
  // Define handle style
  const outputHandleStyle = { background: '#78716c', border: '2px solid #a3a3a3' }; // Keep original output style

  return (
    // Use the base style class, adjust width/min-height as needed
    <div className="scene-node-style w-[400px] min-h-[100px]"> {/* Adjusted min-height */}

      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-id">{id.slice(-4)}</span>
        <span className="node-name">World Node 世界结点</span>
      </div>

      {/* Port Area */}
      <div className="node-port-area"> {/* Default min-height should be okay */}
        {/* Output Handle & Label */}
        <Handle type="source" id="world_info_output" position={Position.Right} style={{ ...outputHandleStyle, top: '50%' }} />
        <span className="handle-label right" style={{ top: '50%' }}>World Info</span>
      </div>

      {/* Content Area */}
      <div className="node-content justify-center items-center">
        <div className="text-center text-xs text-stone-400 p-2">
          (世界信息表单区 / World form area)
        </div>
      </div>
    </div>
  );
}

export default WorldNode;
