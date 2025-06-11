import React, { memo, useState, useCallback } from 'react'; // Added useCallback
import { Handle, Position, type NodeProps, useReactFlow, type Node } from 'reactflow'; // Fix type-only import for Node, Added useReactFlow
// import { Input } from "@/components/ui/input"; // Temporarily comment out
// import { Label } from "@/components/ui/label"; // Temporarily comment out

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
    // Add onClick to the root div, calling the internal handler
    <div
      className="react-flow__node-default p-4 rounded-lg shadow-md border border-gray-300 bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 w-64 cursor-pointer" // Added cursor-pointer
      onClick={handleInternalClick} // Attach the internal click handler
    >
      {/* Node Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
        <strong className="text-lg font-semibold text-purple-800 dark:text-purple-300">{characterName}</strong>
        <span className="text-xs font-mono px-2 py-1 rounded bg-purple-100 text-purple-700 dark:bg-gray-600 dark:text-gray-300">{id}</span>
      </div>

      {/* Node Body - Placeholder for key info or actions */}
      <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {/* Displaying a snippet from characterInfo if available */}
        <p>描述: {data?.characterInfo?.['基本信息']?.['人物小传']?.Value || '未提供'}</p> {/* Removed English */}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">(点击节点查看/编辑详细信息)</p>
        {/* Removed English line */}
      </div>


      {/* Handles */}
      {/* Output Handle (Source) for Character Info */}
      <Handle
        type="source"
        position={Position.Right}
        id="character_info_output" // Unique ID for this handle
        style={{ top: '50%', background: '#8a2be2', width: '10px', height: '10px' }} // Centered vertically, styled
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
