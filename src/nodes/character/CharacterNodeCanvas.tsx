import React from 'react';
import { NodeRenderProps } from '@flowgram.ai/free-layout-editor';

// Define the expected structure of characterJSON for the canvas view.
interface CharacterDetailsFromTemplate {
  name?: string;
  age?: number | string; // Age is now re-added for canvas display
}

// Define the structure of the 'properties' object within node.data
interface CanvasNodeProperties {
  characterJSON: CharacterDetailsFromTemplate;
  // other properties like characterName, characterFilePath might also be here
  // but CharacterNodeCanvas only needs characterJSON for name.
}

// Define the structure of node.data that CharacterNodeCanvas receives
interface CanvasNodeData {
  title?: string; // Optional: if you want to use the node's title
  properties: CanvasNodeProperties;
}

export const CharacterNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  // node.data is expected to conform to CanvasNodeData
  // We access node.data.properties.characterJSON
  const properties = (node as any).data?.properties as CanvasNodeProperties | undefined;
  const characterData = properties?.characterJSON;

  const displayName = characterData?.name || '角色'; // Default to "角色" (Character)
  const displayAge = characterData?.age; // Re-added age

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '10px', // Adjusted padding back for two lines
      border: '1px solid #666',
      borderRadius: '8px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      <div style={{
        fontWeight: 'bold',
        fontSize: '16px',
        color: '#333',
        marginBottom: displayAge !== undefined ? '8px' : '0px', // Add margin only if age is displayed
      }}>
        {displayName}
      </div>
      {displayAge !== undefined && (
        <div style={{
          fontSize: '12px',
          color: '#555'
        }}>
          年龄: {displayAge}
        </div>
      )}
       {/* Optional: Display a placeholder if age is not set and you want one */}
       {/* We removed this before, can be added back if desired 
       displayAge === undefined && (
        <div style={{
          fontSize: '10px',
          fontStyle: 'italic',
          color: '#888'
        }}>
          (年龄未设置)
        </div>
       )*/}
    </div>
  );
}; 