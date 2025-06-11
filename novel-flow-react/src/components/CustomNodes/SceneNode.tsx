import React from 'react'; // Added React import for Fragment
import { Handle, Position, useReactFlow, useNodes, useEdges } from 'reactflow';
import type { NodeProps, Node as ReactFlowNode } from 'reactflow';
import { useContext, useEffect, useMemo } from 'react';
import { FlowContext } from '../Editor/FlowContext';

export type SceneNodeData = {
  label: string;
};

// Removed MergedData interface as input status panel is removed

function SceneNode({ id, data }: NodeProps<SceneNodeData>) {
  const flowContext = useContext(FlowContext);
  const allNodes = useNodes();
  const allEdges = useEdges();

  // Simplified useEffect as input status is no longer displayed
  useEffect(() => {
    // Logic to gather connected node data might still be needed
    // for processing, but not for display in the removed panel.
    // Example: Find connected nodes
    const connectedEdges = allEdges.filter(edge => edge.target === id);
    const connectedNodes = connectedEdges.map(edge =>
      allNodes.find(node => node.id === edge.source)
    ).filter((node): node is ReactFlowNode => !!node);

    // TODO: Process connectedNodes data if needed for scene generation logic
  }, [id, allNodes, allEdges]);


  if (!flowContext) {
    return <div>Loading...</div>;
  }

  // Keep character edge logic for handle calculation and add button
  const { addCharacterNode } = flowContext;
  const characterEdges = flowContext.edges.filter(edge =>
    edge.target === id && edge.targetHandle?.startsWith('character_input_')
  );

  // Define handle style
  const handleStyle = { background: '#1e90ff', width: '8px', height: '8px', borderRadius: '50%' };
  const outputHandleStyle = {...handleStyle};

  // Calculate vertical positions for handles
  // World, Env, Chars, LLM Input, LLM Output (Added llm_output)
  const totalInputHandles = 2 + characterEdges.length + 2; // Increased count by 1 for llm_output
  const verticalSpacing = 100 / (totalInputHandles + 1); // +1 for spacing at top/bottom

  return (
    // Base style, using the adjusted size
    <div className="scene-node-style w-[800px] min-h-[400px]"> {/* Adjusted min-height based on content reduction */}

      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-id">{id.slice(-4)}</span>
        <span className="node-name">场景结点</span> {/* Removed English */}
        {/* Add Character button moved to Title Bar for space */}
         <button onClick={addCharacterNode} className="ml-auto text-[10px] px-2 py-0.5">
           + 角色 {/* Changed to Chinese */}
         </button>
      </div>

      {/* Port Area */}
      <div className="node-port-area" style={{ minHeight: `${totalInputHandles * 20}px` }}>
        {/* Input Handles & Labels - Recalculated positions */}
        <Handle type="target" id="world" position={Position.Left} style={{ ...handleStyle, top: `${1 * verticalSpacing}%` }} />
        <span className="handle-label left" style={{ top: `${1 * verticalSpacing}%` }}>世界</span> {/* Changed to Chinese */}

        <Handle type="target" id="environment" position={Position.Left} style={{ ...handleStyle, top: `${2 * verticalSpacing}%` }} />
        <span className="handle-label left" style={{ top: `${2 * verticalSpacing}%` }}>环境</span> {/* Changed to Chinese */}

        {characterEdges.map((edge, index) => (
          <React.Fragment key={edge.targetHandle}>
            <Handle
              type="target"
              id={edge.targetHandle!}
              position={Position.Left}
              style={{ ...handleStyle, top: `${(3 + index) * verticalSpacing}%` }}
            />
            <span className="handle-label left" style={{ top: `${(3 + index) * verticalSpacing}%` }}>{`角色 ${index + 1}`}</span> {/* Changed to Chinese */}
          </React.Fragment>
         ))}

        {/* Recalculated position for llm_input */}
        <Handle type="target" id="llm_input" position={Position.Left} style={{ ...handleStyle, top: `${(3 + characterEdges.length) * verticalSpacing}%` }}/>
        <span className="handle-label left" style={{ top: `${(3 + characterEdges.length) * verticalSpacing}%` }}>LLM 输入</span> {/* Changed to Chinese */}

        {/* ADDED llm_output handle and label */}
        <Handle type="target" id="llm_output" position={Position.Left} style={{ ...handleStyle, top: `${(4 + characterEdges.length) * verticalSpacing}%` }}/>
        <span className="handle-label left" style={{ top: `${(4 + characterEdges.length) * verticalSpacing}%` }}>LLM 输出</span> {/* Added Label */}


        {/* Output Handle & Label */}
        <Handle type="source" id="scene_data_output" position={Position.Right} style={{ ...outputHandleStyle, top: '50%' }} />
        <span className="handle-label right" style={{ top: '50%' }}>场景数据</span> {/* Changed to Chinese */}
      </div>

      {/* Content Area - Simplified Vertical Layout */}
      {/* node-content already has padding: 8px via CSS */}
      <div className="node-content flex flex-col flex-grow">

        {/* Top Section: Synopsis Only */}
        {/* Removed the outer flex-row div and the input status panel */}
        <div className="node-content-synopsis flex flex-col mb-2 flex-shrink-0"> {/* Takes full width now */}
           <h4 className="text-center text-xs mb-1 font-semibold">场景梗概</h4> {/* Removed English */}
           <textarea
             // Removed w-full, added whitespace-normal
             className="scrollable-content whitespace-normal"
             placeholder="输入要生成场景的梗概..." // Removed English
             style={{ minHeight: '100px'}}
           ></textarea>
        </div>

        {/* Bottom Section: LLM Output */}
        {/* This section naturally takes full width due to flex-col parent */}
        <div className="node-content-llm-output flex flex-col mt-2 border-t border-stone-700 pt-2 flex-grow">
          <h4 className="text-center text-xs mb-1 font-semibold flex-shrink-0">大模型输出</h4> {/* Removed English */}
          <textarea
             // Removed w-full, added whitespace-normal
            className="scrollable-content readonly whitespace-normal flex-grow"
            placeholder="大模型生成结果将在此显示..." // Removed English
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default SceneNode;
