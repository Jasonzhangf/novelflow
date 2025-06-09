import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export type WorldNodeData = {
  label: string;
  version: string;
  worldInfo: Record<string, any>;
};

function WorldNode({ data }: NodeProps<WorldNodeData>) {
  return (
    <div className="rounded-lg shadow-xl border-4 border-red-500 bg-white w-[400px] min-h-[120px] relative overflow-visible">
      {/* Title Bar 标题栏 */}
      <div className="rounded-t-lg bg-stone-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="font-bold text-base flex items-center">
          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
          World Node 世界结点
        </div>
        <div className="text-xs opacity-70">{data.label || 'World'}</div>
      </div>
      {/* Main Content 主体内容 */}
      <div className="p-4">
        {/* TODO: Add world setting form fields here 世界信息表单区 */}
      </div>
      {/* Output Handle 输出端口 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-6 flex items-center z-10">
        <div className="pr-2 text-xs text-stone-700">World Info 世界信息</div>
        <Handle type="source" position={Position.Right} style={{ background: '#78716c', border: '2px solid #a3a3a3' }} />
      </div>
    </div>
  );
}

export default WorldNode; 