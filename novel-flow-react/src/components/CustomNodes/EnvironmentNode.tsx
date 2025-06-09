import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type EnvironmentNodeData = {
  label: string;
  version: string;
  environmentInfo: Record<string, any>;
};

function EnvironmentNode({ data }: NodeProps<EnvironmentNodeData>) {
  return (
    <div className="border border-green-400 rounded-md p-4 bg-white shadow-md">
      <div className="font-bold mb-2 text-green-600">{data.label || 'Environment Node'}</div>
      {/* TODO: Add environment setting form fields here */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default EnvironmentNode; 