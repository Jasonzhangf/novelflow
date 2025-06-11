import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type EnvironmentNodeData = {
  label: string;
  version: string;
  environmentInfo: Record<string, any>;
};

function EnvironmentNode({ id, data }: NodeProps<EnvironmentNodeData>) {
  // Define handle style
  const outputHandleStyle = { background: '#78716c', border: '2px solid #a3a3a3' }; // Example output style

  return (
    // Use the base style class, adjust width/min-height as needed
    <div className="scene-node-style w-[400px] min-h-[100px]"> {/* Adjusted min-height */}

      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-id">{id.slice(-4)}</span>
        <span className="node-name">环境结点</span> {/* Removed English */}
      </div>

      {/* Port Area */}
      <div className="node-port-area">
        {/* Output Handle & Label */}
        <Handle type="source" id="environment_info_output" position={Position.Right} style={{ ...outputHandleStyle, top: '50%' }} />
        <span className="handle-label right" style={{ top: '50%' }}>环境信息</span> {/* Removed English */}
      </div>

      {/* Content Area - Use CSS classes for styling */}
      <div className="node-content justify-center items-center">
         {/* Use appropriate text color for dark theme */}
        <div className="text-center text-xs text-stone-400 p-2"> {/* Adjusted text color */}
          (环境信息表单区) {/* Removed English */}
        </div>
      </div>
    </div>
  );
}

export default EnvironmentNode;
