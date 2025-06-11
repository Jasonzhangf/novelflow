import React from 'react'; // Added React import for Fragment
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

  // Define handle style
  const handleStyle = { background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' };
  const outputHandleStyle = {...handleStyle}; // Same style for output for now

  // Calculate vertical positions for handles within the port area
  const totalInputHandles = 2 + characterEdges.length + 1; // World, Env, Chars, LLM
  // Use percentages relative to the port area height.
  const verticalSpacing = 100 / (totalInputHandles + 1); // Percentage spacing within port area

  return (
    // Use the base style class, adjust width/min-height as needed
    <div className="scene-node-style w-[600px] min-h-[250px]"> {/* Adjusted min-height */}

      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-id">{id.slice(-4)}</span>
        <span className="node-name">Scene Node 场景结点</span>
      </div>

      {/* Port Area */}
      {/* Calculate dynamic minHeight based on handles, e.g., 15px per handle + padding */}
      <div className="node-port-area" style={{ minHeight: `${totalInputHandles * 15 + 10}px` }}>
        {/* Input Handles & Labels */}
        <Handle type="target" id="world" position={Position.Left} style={{ ...handleStyle, top: `${1 * verticalSpacing}%` }} />
        <span className="handle-label left" style={{ top: `${1 * verticalSpacing}%` }}>World</span>

        <Handle type="target" id="environment" position={Position.Left} style={{ ...handleStyle, top: `${2 * verticalSpacing}%` }} />
        <span className="handle-label left" style={{ top: `${2 * verticalSpacing}%` }}>Env</span>

        {characterEdges.map((edge, index) => (
          <React.Fragment key={edge.targetHandle}>
            <Handle
              type="target"
              id={edge.targetHandle!}
              position={Position.Left}
              style={{ ...handleStyle, top: `${(3 + index) * verticalSpacing}%` }}
            />
            <span className="handle-label left" style={{ top: `${(3 + index) * verticalSpacing}%` }}>{`Char ${index + 1}`}</span>
          </React.Fragment>
         ))}

        <Handle type="target" id="llm_output" position={Position.Left} style={{ ...handleStyle, top: `${(3 + characterEdges.length) * verticalSpacing}%` }}/>
        <span className="handle-label left" style={{ top: `${(3 + characterEdges.length) * verticalSpacing}%` }}>LLM</span>

        {/* Output Handle & Label */}
        <Handle type="source" id="scene_data_output" position={Position.Right} style={{ ...outputHandleStyle, top: '50%' }} />
        <span className="handle-label right" style={{ top: '50%' }}>Scene Data</span>
      </div>

      {/* Content Area */}
      <div className="node-content">
        {/* Left Panel: Inputs Status & Controls */}
        <div className="node-content-left">
          <h4 className="font-semibold text-stone-700 text-center text-xs mb-2">Inputs 输入状态</h4>
          {/* Display connection status inside (simplified) */}
          <div className="text-[10px] text-stone-600">World: {nodes.find(n => n.id === allEdges.find(e => e.target === id && e.targetHandle === 'world')?.source) ? '已连接' : '未连接'}</div>
          <div className="text-[10px] text-stone-600">Environment: {nodes.find(n => n.id === allEdges.find(e => e.target === id && e.targetHandle === 'environment')?.source) ? '已连接' : '未连接'}</div>
          {characterInputs.map((node, index) => (
            <div key={node.id} className="text-[10px] text-stone-600">{node.data.label || `Character ${index + 1}`}: 已连接</div>
          ))}
           <div className="text-[10px] text-stone-600">LLM Output: {nodes.find(n => n.id === allEdges.find(e => e.target === id && e.targetHandle === 'llm_output')?.source) ? '已连接' : '未连接'}</div>
          <button onClick={addCharacterNode} className="mt-auto w-full bg-stone-700 hover:bg-stone-900 text-white font-bold py-1 px-2 rounded text-[10px]">
            Add Character 添加角色
          </button>
        </div>

        {/* Right Panel: Synopsis & LLM Output */}
        <div className="node-content-right">
          <h4 className="font-medium text-gray-600 text-center text-xs mb-1">Scene Synopsis 场景梗概</h4>
          <textarea
            className="scrollable-content w-full flex-grow" // Use flex-grow to take space
            placeholder="Enter a synopsis for the scene to be generated...\n输入要生成场景的梗概..."
            style={{ minHeight: '80px' }} // Ensure minimum height
          ></textarea>
          <h4 className="font-medium text-gray-600 text-center text-xs mt-2 mb-1">LLM Output 大模型输出</h4>
          <textarea
            className="scrollable-content readonly w-full flex-grow" // Use flex-grow
            placeholder="LLM generation result will appear here...\n大模型生成结果将在此显示..."
            readOnly
            style={{ minHeight: '120px' }} // Ensure minimum height
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default SceneNode;
