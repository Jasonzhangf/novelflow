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
  // Now only World, Env, Chars, LLM Input (no Add Character button in this calculation)
  const totalInputHandles = 2 + characterEdges.length + 1;
  const verticalSpacing = 100 / (totalInputHandles + 1);

  return (
    // Base style, using the adjusted size
    <div className="scene-node-style w-[800px] min-h-[400px]"> {/* Adjusted min-height based on content reduction */}

      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-id">{id.slice(-4)}</span>
        <span className="node-name">Scene Node 场景结点</span>
        {/* Add Character button moved to Title Bar for space */}
         <button onClick={addCharacterNode} className="ml-auto text-[10px] px-2 py-0.5">
           + Char
         </button>
      </div>

      {/* Port Area */}
      <div className="node-port-area" style={{ minHeight: `${totalInputHandles * 20}px` }}>
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

        <Handle type="target" id="llm_input" position={Position.Left} style={{ ...handleStyle, top: `${(3 + characterEdges.length) * verticalSpacing}%` }}/>
        <span className="handle-label left" style={{ top: `${(3 + characterEdges.length) * verticalSpacing}%` }}>LLM Input</span>

        {/* Output Handle & Label */}
        <Handle type="source" id="scene_data_output" position={Position.Right} style={{ ...outputHandleStyle, top: '50%' }} />
        <span className="handle-label right" style={{ top: '50%' }}>Scene Data</span>
      </div>

      {/* Content Area - Simplified Vertical Layout */}
      {/* node-content already has padding: 8px via CSS */}
      <div className="node-content flex flex-col flex-grow">

        {/* Top Section: Synopsis Only */}
        {/* Removed the outer flex-row div and the input status panel */}
        <div className="node-content-synopsis flex flex-col mb-2 flex-shrink-0"> {/* Takes full width now */}
           <h4 className="text-center text-xs mb-1 font-semibold">Scene Synopsis 场景梗概</h4>
           <textarea
             // Removed w-full, added whitespace-normal
             className="scrollable-content whitespace-normal"
             placeholder="Enter a synopsis for the scene to be generated...\n输入要生成场景的梗概..."
             style={{ minHeight: '100px'}}
           ></textarea>
        </div>

        {/* Bottom Section: LLM Output */}
        {/* This section naturally takes full width due to flex-col parent */}
        <div className="node-content-llm-output flex flex-col mt-2 border-t border-stone-700 pt-2 flex-grow">
          <h4 className="text-center text-xs mb-1 font-semibold flex-shrink-0">LLM Output 大模型输出</h4>
          <textarea
             // Removed w-full, added whitespace-normal
            className="scrollable-content readonly whitespace-normal flex-grow"
            placeholder="LLM generation result will appear here...\n大模型生成结果将在此显示..."
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default SceneNode;
