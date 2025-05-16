import { NodeRenderProps, useNodeRender } from '@flowgram.ai/free-layout-editor';
import React from 'react';
import { NodeWrapper } from '../../components/base-node/node-wrapper';
import { NodeRenderContext } from '../../context';

// Define the expected structure of characterJSON for the canvas view.
interface CharacterDetailsFromTemplate {
  name?: string;
  age?: number | string; // Age is now re-added for canvas display
}

// Define the structure of the 'properties' object within node.data
interface CanvasNodeProperties {
  characterName?: string; // Added to explicitly include characterName
  characterJSON: CharacterDetailsFromTemplate;
  // other properties like characterFilePath might also be here
  // but CharacterNodeCanvas only needs characterJSON for name.
}

// Define the structure of node.data that CharacterNodeCanvas receives
interface CanvasNodeData {
  title?: string; // Optional: if you want to use the node's title
  properties: CanvasNodeProperties;
}

export const CharacterNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  const nodeRender = useNodeRender(); // Use the hook

  // Access data using nodeRender.form.values, which represents node.data
  const nodeData = nodeRender.form?.values as CanvasNodeData | undefined;

  // Correctly access characterName and characterJSON from nodeData.properties
  const characterName = nodeData?.properties?.characterName;
  const characterJSON = nodeData?.properties?.characterJSON;

  const displayName = String(characterName || 'Unknown Character / 未知角色');
  // Access age from the retrieved characterJSON object
  const displayAge = String(characterJSON?.age || '??');

  return (
    <NodeRenderContext.Provider value={nodeRender}>
      <NodeWrapper>
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', background: '#f9f9f9', width: '100%', height: '100%', boxSizing: 'border-box' }}>
          <div><strong>{displayName}</strong></div>
          <div>Age / 年龄: {displayAge}</div>
        </div>
      </NodeWrapper>
    </NodeRenderContext.Provider>
  );
}; 