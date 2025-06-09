import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type WorldNodeData = {
  label: string;
  version: string;
  worldInfo: Record<string, any>;
};

function WorldNode({ data }: NodeProps<WorldNodeData>) {
  return (
    <div className="border border-blue-400 rounded-md p-4 bg-white shadow-md">
      <div className="font-bold mb-2 text-blue-600">{data.label || 'World Node'}</div>
      {/* TODO: Add world setting form fields here */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default WorldNode; 