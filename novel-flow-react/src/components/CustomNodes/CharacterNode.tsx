import React, { memo, useState, useCallback } from 'react'; // Added useCallback
import { Handle, Position, type NodeProps, useReactFlow, type Node } from 'reactflow'; // Fix type-only import for Node, Added useReactFlow

// Define the structure for character data
interface CharacterData {
  label: string; // Character Name displayed on node
  version: string; // Version of the data structure
  // Add other character properties based on your JSON structure
  // For now, keep characterInfo flexible, assuming it comes from JSON
  characterInfo: Record<string, any>;
  // Add onClick handler to the data interface
  onClick?: (node: Node) => void; // Optional onClick passed via data
}

// Define the props for the CharacterNode, extending NodeProps
interface CharacterNodeProps extends NodeProps<CharacterData> {}

const CharacterNode: React.FC<CharacterNodeProps> = memo(({ data, id }) => {
  const { getNode } = useReactFlow(); // Get hook to access node instance

  // Use data.label for the character name, fallback to a default if needed
  const characterName = data?.label || `角色 (${id})`; // Default label uses node ID

  // Define the internal click handler
  const handleInternalClick = useCallback(() => {
      console.log(`[CharacterNode ${id}] Internal click detected.`);
      if (data?.onClick) {
          const nodeInstance = getNode(id);
          if (nodeInstance) {
              console.log(`[CharacterNode ${id}] Calling onClick passed via data.`);
              data.onClick(nodeInstance); // Call the passed handler with the node instance
          } else {
              console.warn(`[CharacterNode ${id}] Could not find node instance.`);
          }
      } else {
          console.log(`[CharacterNode ${id}] No onClick handler passed via data.`);
      }
  }, [data, getNode, id]);

  return (
    // Apply scene-node-style for dark theme consistency and add cursor-pointer
    <div
      className="scene-node-style w-64 cursor-pointer" // Use dark theme style, keep width and cursor
      onClick={handleInternalClick} // Attach the internal click handler
    >
      {/* Node Title Bar (Matches index.css) */}
      <div className="node-title-bar">
         <span className="node-id">{id}</span> {/* Apply node-id style */}
         <strong className="node-name">{characterName}</strong> {/* Apply node-name style */}
      </div>

      {/* Node Body - Apply node-content style */}
      <div className="node-content">
        {/* Adjust text colors for dark theme */}
        <div className="text-sm text-stone-300 mb-3"> {/* Use text-stone-300 */}
          <p>描述: {data?.characterInfo?.['基本信息']?.['人物小传']?.Value || '未提供'}</p>
          <p className="mt-1 text-xs text-stone-400">(点击节点查看/编辑详细信息)</p> {/* Use text-stone-400 */}
        </div>
      </div>

      {/* Handles */}
      {/* Output Handle (Source) for Character Info */}
      <Handle
        type="source"
        position={Position.Right}
        id="character_info_output" // Unique ID for this handle
        // Update handle style for dark theme if needed, e.g., brighter color
        style={{ top: '50%', background: '#a78bfa', width: '10px', height: '10px' }} // Brighter purple for dark bg
        className="react-flow__handle-right"
      />

       {/* Optional Input Handle (Target) if characters can receive data */}
       {/*
       <Handle
         type="target"
         position={Position.Left}
         id="character_input"
         style={{ top: '50%', background: '#555' }}
         className="react-flow__handle-left"
       />
       */}
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';

export default CharacterNode;
