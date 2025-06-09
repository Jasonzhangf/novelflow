import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type LLMNodeData = {
  label: string;
};

// A simple LLM Node for now.
// It has a target handle to receive the merged JSON from the SceneNode
// and a source handle to send back the generated text.
function LLMNode({ data }: NodeProps<LLMNodeData>) {
  return (
    <div className="border border-green-500 rounded-md p-4 bg-white shadow-lg w-64">
      <Handle type="target" position={Position.Left} />
      <div className="font-bold mb-2 text-green-700 text-center">{data.label || 'LLM'}</div>
      <div className="text-center text-xs text-gray-500">
        (This node will process the scene)
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default LLMNode; 