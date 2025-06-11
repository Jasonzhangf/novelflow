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

  // Apply custom CSS class and keep layout/sizing classes
  return (
    <div className="scene-node-style w-[600px] min-h-[320px] relative overflow-visible"> {/* Applied custom class, removed conflicting Tailwind styles */}
      {/* Title Bar 标题栏 */}
      <div className="header text-gray-700 px-4 py-2 flex items-center justify-between"> {/* Applied custom class, removed conflicting Tailwind styles */}
        {/* Optional: Add icon here if needed */}
        <div className="font-medium text-sm flex items-center"> {/* Adjusted font weight */}
          Scene Node 场景结点
        </div>
        {/* Removed the right side label for closer match to reference */}
      </div>

      {/* Input Handles (Placed on Border) */}
      {/* These handles are positioned by React Flow based on `position`. Offset added for vertical spacing. */}
      <Handle type="target" id="world" position={Position.Left} style={{ top: '30%', background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' }} />
      <Handle type="target" id="environment" position={Position.Left} style={{ top: '45%', background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' }} />
      {characterEdges.map((edge, index) => (
        <Handle
          key={edge.targetHandle}
          type="target"
          id={edge.targetHandle!}
          position={Position.Left}
          style={{ top: `${60 + index * 15}%`, background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' }}
        />
       ))}
      <Handle type="target" id="llm_output" position={Position.Left} style={{ bottom: '10%', top: 'auto', background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' }}/>

      {/* Output Handle (Placed on Border) */}
      <Handle type="source" position={Position.Right} style={{ top: '50%', background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' }} />


      {/* Main Content 主体内容 */}
      <div className="flex flex-row pt-2 pb-2"> {/* Removed divider */}
        {/* Inputs Panel 输入区 */}
        <div className="input-panel w-1/3 p-4 space-y-1 min-h-[220px] relative"> {/* Applied custom class, removed conflicting Tailwind styles */}
          {/* Input Labels (Inside Node, near handles) */}
          <div className="absolute left-2 top-1/4 mt-3"> {/* Positioning labels near handles */}
             <div className="text-[9px] text-blue-600 mb-4">World</div>
             <div className="text-[9px] text-blue-600 mb-4">Env</div>
             {characterEdges.map((_, index) => (
               <div key={`label-${index}`} className="text-[9px] text-blue-600 mb-4">{`Char ${index + 1}`}</div>
             ))}
             <div className="text-[9px] text-blue-600 mt-6">LLM</div>
           </div>

          <h4 className="font-semibold text-stone-700 text-center text-xs mb-2 pt-2">Inputs 输入</h4>
          {/* Display connection status inside */}
          <div className="text-[10px] text-stone-600 pl-12">World: 已连接</div> {/* Added padding to avoid overlap */}
          <div className="text-[10px] text-stone-600 pl-12">Environment: 已连接</div>
          {characterInputs.map((node, index) => (
            <div key={node.id} className="text-[10px] text-stone-600 pl-12">{node.data.label || `Character ${index + 1}`}: 已连接</div>
          ))}
           <div className="text-[10px] text-stone-600 pl-12">LLM Output: 已连接</div>
          <button onClick={addCharacterNode} className="mt-2 w-full bg-stone-700 hover:bg-stone-900 text-white font-bold py-1 px-2 rounded text-[10px]"> {/* Smaller button text */}
            Add Character 添加角色
          </button>
        </div>
        {/* Scene Synopsis & LLM Output 场景梗概与输出区 */}
        <div className="w-2/3 p-4 space-y-2 relative">
           {/* Removed the absolutely positioned output label */}
            {/* Output Label - Mimicking reference style */}
           <div className="text-[9px] text-gray-500 text-right">Scene Data Output</div>


          <h4 className="font-medium text-gray-600 text-center text-xs mb-1">Scene Synopsis 场景梗概</h4> {/* Adjusted title style */}
          <textarea
            className="synopsis-textarea w-full h-24 p-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" /* Applied custom class, removed conflicting Tailwind styles */
            placeholder="Enter a synopsis for the scene to be generated...\n输入要生成场景的梗概..."
          ></textarea>
          <h4 className="font-medium text-gray-600 text-center text-xs mt-2">LLM Output 大模型输出</h4> {/* Adjusted title style */}
          <textarea
            className="llm-output-textarea w-full h-32 p-2 rounded text-xs" /* Applied custom class, removed conflicting Tailwind styles */
            placeholder="LLM generation result will appear here...\n大模型生成结果将在此显示..."
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default SceneNode;
