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
      // Find the edge that connects this source node to the current scene node
      const edge = connectedEdges.find(e => e.source === node.id);

      if (edge?.targetHandle === 'llm_output') {
          // You might want to do something specific with the LLM data
          // For now, let's just log it or store it.
          console.log(`Received data from LLM:`, node.data);
          llmOutputData = node.data;
          return; // Continue to next node
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
           if (node.type !== 'llm') { // Avoid merging the LLM node itself into 'others'
            mergedData.others.push(node.data);
          }
          break;
      }
    });

    console.log(`SceneNode (${id}) Merged JSON:`, JSON.stringify(mergedData, null, 2));

  }, [id, allNodes, allEdges]);

  if (!flowContext) {
    // Handle case where context is not yet available
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
    <div className="border border-purple-500 rounded-md p-4 bg-white shadow-lg w-[600px] text-sm">
      {/* Input Handles */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-around -translate-x-1/2">
          {/* Fixed input handles */}
          <Handle type="target" id="world" position={Position.Left} style={{ top: '10%' }} />
          <Handle type="target" id="environment" position={Position.Left} style={{ top: '20%' }} />

          {/* Dynamic input handles for characters */}
          {characterEdges.map((edge, index) => (
            <Handle
              key={edge.targetHandle}
              type="target"
              id={edge.targetHandle!}
              position={Position.Left}
              style={{ top: `${30 + index * 10}%` }}
            />
          ))}

          {/* Handle for LLM Output */}
          <Handle type="target" id="llm_output" position={Position.Left} style={{ bottom: '10%', top: 'auto' }}/>
      </div>


      <div className="font-bold mb-2 text-purple-700 text-center">{data.label || 'Scene'}</div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Left Connections Panel */}
        <div className="col-span-1 space-y-2 border-r pr-2">
            <h4 className="font-semibold text-center">Inputs</h4>
            <div>World: Connected</div>
            <div>Environment: Connected</div>
            {characterInputs.map(node => (
              <div key={node.id}>{node.data.label}: Connected</div>
            ))}
             <button onClick={addCharacterNode} className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">
                Add Character
            </button>
        </div>

        {/* Center Synopsis Panel */}
        <div className="col-span-2 space-y-2">
            <h4 className="font-semibold text-center">Scene Synopsis</h4>
            <textarea 
                className="w-full h-32 p-2 border rounded"
                placeholder="Enter a synopsis for the scene to be generated..."
            ></textarea>
            
            <h4 className="font-semibold text-center mt-4">LLM Output</h4>
            <textarea 
                className="w-full h-48 p-2 border rounded bg-gray-100"
                placeholder="LLM generation result will appear here..."
                readOnly
            ></textarea>
        </div>
      </div>


      {/* Source handle to send data to LLM */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default SceneNode; 