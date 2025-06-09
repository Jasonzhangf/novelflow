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
    <div className="rounded-lg shadow-xl border-4 border-red-500 bg-white w-[400px] min-h-[120px] relative overflow-visible">
      {/* Title Bar 标题栏 */}
      <div className="rounded-t-lg bg-stone-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="font-bold text-base flex items-center">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          LLM Node 大模型结点
        </div>
        <div className="text-xs opacity-70">{data.label || 'LLM'}</div>
      </div>
      {/* Main Content 主体内容 */}
      <div className="p-4 text-center text-xs text-stone-500">
        (This node will process the scene / 此结点将处理场景)
      </div>
      {/* Input Handle 输入端口 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full ml-[-20px] flex items-center z-10">
        <div className="pr-2 text-xs text-stone-700">Scene Data 场景数据</div>
        <Handle type="target" position={Position.Left} style={{ background: '#78716c', border: '2px solid #a3a3a3' }}/>
      </div>
      {/* Output Handle 输出端口 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full mr-[-20px] flex items-center z-10">
        <Handle type="source" position={Position.Right} style={{ background: '#78716c', border: '2px solid #a3a3a3' }}/>
        <div className="pl-2 text-xs text-stone-700">LLM Output 大模型输出</div>
      </div>
    </div>
  );
}

export default LLMNode; 