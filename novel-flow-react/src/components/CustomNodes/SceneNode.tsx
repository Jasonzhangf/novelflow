import { Handle, Position, useReactFlow, useNodes, useEdges } from 'reactflow';
import type { NodeProps, Node as ReactFlowNode } from 'reactflow';
import { useContext, useEffect, useMemo } from 'react';
import { FlowContext } from '../Editor/FlowContext';

export type SceneNodeData = {
  label: string;
};

interface MergedData {
  characters: any[];
  world: any;
  environment: any;
  others: any[];
}

function SceneNode({ id, data }: NodeProps<SceneNodeData>) {
  const flowContext = useContext(FlowContext);
  const allNodes = useNodes();
  const allEdges = useEdges();

  useEffect(() => {
    const connectedEdges = allEdges.filter(edge => edge.target === id);
    const connectedNodes = connectedEdges.map(edge => 
      allNodes.find(node => node.id === edge.source)
    ).filter((node): node is ReactFlowNode => !!node);

    const mergedData: MergedData = {
      characters: [],
      world: {},
      environment: {},
      others: [],
    };

    let llmOutputData = {};

    connectedNodes.forEach(node => {
      const edge = connectedEdges.find(e => e.source === node.id);
      if (edge?.targetHandle === 'llm_output') {
        llmOutputData = node.data;
        return;
      }
      switch (node.type) {
        case 'character':
          mergedData.characters.push(node.data);
          break;
        case 'world':
          mergedData.world = node.data;
          break;
        case 'environment':
          mergedData.environment = node.data;
          break;
        default:
          if (node.type !== 'llm') {
            mergedData.others.push(node.data);
          }
          break;
      }
    });
  }, [id, allNodes, allEdges]);

  if (!flowContext) {
    return <div>Loading...</div>;
  }

  const { addCharacterNode, nodes } = flowContext;
  const characterEdges = flowContext.edges.filter(edge => 
    edge.target === id && edge.targetHandle?.startsWith('character_input_')
  );
  const characterInputs = characterEdges
    .map(edge => nodes.find(node => node.id === edge.source))
    .filter((node): node is ReactFlowNode => !!node);

  return (
    <div className="rounded-lg shadow-xl border-4 border-red-500 bg-white w-[600px] min-h-[320px] relative overflow-visible">
      {/* Title Bar 标题栏 */}
      <div className="rounded-t-lg bg-stone-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="font-bold text-base flex items-center">
          <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
          Scene Node 场景结点
        </div>
        <div className="text-xs opacity-70">{data.label || 'Scene'}</div>
      </div>
      {/* Input Handles 输入端口 */}
      <div className="absolute left-0 top-14 h-[calc(100%-3.5rem)] flex flex-col justify-around -translate-x-full -ml-8 z-10">
        <div className="flex items-center mb-2">
          <div className="pr-2 text-xs text-stone-700">World 世界</div>
          <Handle type="target" id="world" position={Position.Left} style={{ background: '#78716c', border: '2px solid #a3a3a3' }} />
        </div>
        <div className="flex items-center mb-2">
          <div className="pr-2 text-xs text-stone-700">Environment 环境</div>
          <Handle type="target" id="environment" position={Position.Left} style={{ background: '#78716c', border: '2px solid #a3a3a3' }} />
        </div>
        {characterEdges.map((edge, index) => (
          <div key={edge.targetHandle} className="flex items-center mb-2">
            <div className="pr-2 text-xs text-stone-700">{`Character ${index + 1} 角色${index + 1}`}</div>
            <Handle
              type="target"
              id={edge.targetHandle!}
              position={Position.Left}
              style={{ background: '#78716c', border: '2px solid #a3a3a3' }}
            />
          </div>
        ))}
        <div className="flex items-center mb-2">
          <div className="pr-2 text-xs text-stone-700">LLM Output 大模型输出</div>
          <Handle type="target" id="llm_output" position={Position.Left} style={{ background: '#78716c', border: '2px solid #a3a3a3' }}/>
        </div>
      </div>
      {/* Main Content 主体内容 */}
      <div className="flex flex-row divide-x divide-stone-200">
        {/* Inputs Panel 输入区 */}
        <div className="w-1/3 p-4 space-y-2 bg-stone-50 min-h-[220px]">
          <h4 className="font-semibold text-stone-700 text-center text-xs mb-2">Inputs 输入</h4>
          <div className="text-xs text-stone-600">World: 已连接</div>
          <div className="text-xs text-stone-600">Environment: 已连接</div>
          {characterInputs.map(node => (
            <div key={node.id} className="text-xs text-stone-600">{node.data.label}: 已连接</div>
          ))}
          <button onClick={addCharacterNode} className="mt-2 w-full bg-stone-700 hover:bg-stone-900 text-white font-bold py-1 px-2 rounded text-xs">
            Add Character 添加角色
          </button>
        </div>
        {/* Scene Synopsis & LLM Output 场景梗概与输出区 */}
        <div className="w-2/3 p-4 space-y-2">
          <h4 className="font-semibold text-stone-700 text-center text-xs mb-1">Scene Synopsis 场景梗概</h4>
          <textarea 
            className="w-full h-24 p-2 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="Enter a synopsis for the scene to be generated...\n输入要生成场景的梗概..."
          ></textarea>
          <h4 className="font-semibold text-stone-700 text-center text-xs mt-2">LLM Output 大模型输出</h4>
          <textarea 
            className="w-full h-32 p-2 border border-stone-200 rounded bg-stone-100 text-xs"
            placeholder="LLM generation result will appear here...\n大模型生成结果将在此显示..."
            readOnly
          ></textarea>
        </div>
      </div>
      {/* Output Handle 输出端口 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-8 flex items-center z-10">
        <div className="pr-2 text-xs text-stone-700">Scene Data 场景数据</div>
        <Handle type="source" position={Position.Right} style={{ background: '#78716c', border: '2px solid #a3a3a3' }} />
      </div>
    </div>
  );
}

export default SceneNode; 