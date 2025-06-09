import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type CharacterNodeData = {
  label: string;
  version: string;
  characterInfo: Record<string, any>;
};

function CharacterNode({ data }: NodeProps<CharacterNodeData>) {
  return (
    <div className="border border-gray-400 rounded-md p-4 bg-white shadow-md">
      <div className="font-bold mb-2">{data.label || 'Character Node'}</div>
      {/* TODO: Add character form fields here */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default CharacterNode; 