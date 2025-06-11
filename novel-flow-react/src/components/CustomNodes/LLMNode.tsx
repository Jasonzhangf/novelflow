import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type LLMNodeData = {
  label: string;
};

// A simple LLM Node for now.
// It has a target handle to receive the merged JSON from the SceneNode
// and a source handle to send back the generated text.
function LLMNode({ id, data }: NodeProps<LLMNodeData>) { // Added id prop
  // Define handle style (consistent with SceneNode)
  const handleStyle = { background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' };
  const outputHandleStyle = { background: '#78716c', border: '2px solid #a3a3a3' }; // Keep original output style for now

  return (
    // Use the base style class, adjust width/min-height as needed
    <div className="scene-node-style w-[400px] min-h-[100px]"> {/* Adjusted min-height */}

      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-id">{id.slice(-4)}</span>
        <span className="node-name">LLM Node 大模型结点</span>
      </div>

      {/* Port Area */}
      <div className="node-port-area"> {/* Default min-height should be okay */}
        {/* Input Handle & Label */}
        <Handle type="target" id="scene_data_input" position={Position.Left} style={{ ...handleStyle, top: '50%' }} />
        <span className="handle-label left" style={{ top: '50%' }}>Scene Data</span>

        {/* Output Handle & Label */}
        <Handle type="source" id="llm_output" position={Position.Right} style={{ ...outputHandleStyle, top: '50%' }} />
        <span className="handle-label right" style={{ top: '50%' }}>LLM Output</span>
      </div>

      {/* Content Area */}
      <div className="node-content justify-center items-center"> {/* Center content */}
        <div className="text-center text-xs text-stone-500 p-2">
          (This node will process the scene / 此结点将处理场景)
        </div>
      </div>
    </div>
  );
}

export default LLMNode;
