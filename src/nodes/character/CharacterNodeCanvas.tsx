import React, { useState, useEffect } from 'react';

import { NodeRenderProps, useNodeRender, FlowNodeVariableData, ASTFactory } from '@flowgram.ai/free-layout-editor';

import { NodeRenderContext } from '../../context';
import { NodeWrapper } from '../../components/base-node/node-wrapper';

// Define the expected structure of characterJSON for the canvas view.
interface CharacterDetailsFromCanvas {
  name?: string;
  age?: number | string | null; 
}

// Define the structure of node.data that CharacterNodeCanvas might receive or read
interface CanvasNodeData {
  title?: string; 
  characterJSON?: CharacterDetailsFromCanvas; // Expect characterJSON at data.characterJSON
  // Legacy or alternative paths if necessary
  name?: string; // Could be at data.name (legacy)
  age?: number | string | null; // Could be at data.age (legacy)
  properties?: { // Could be at data.properties.characterJSON (legacy)
    characterJSON?: CharacterDetailsFromCanvas;
  };
}

export const CharacterNodeCanvas: React.FC<
  NodeRenderProps & { t?: (key: string, options?: any) => string }
> = ({ node, t }) => {
  const nodeRender = useNodeRender();
  // const formValues = nodeRender.form?.values as any; // Values from the form hook
  // const nodeDataFromProps = node.data as any; // Direct data from the node prop

  // State to hold display values, refreshed from node data
  const [displayName, setDisplayName] = useState('未命名 / Untitled');
  const [displayAge, setDisplayAge] = useState<string | number | null>('未知 / Unknown');

  const tSafe = (key: string, options?: any) => {
    if (typeof t === 'function') return t(key, options);
    if (options?.defaultValue) return options.defaultValue;
    const keyParts = key.split('.');
    return keyParts[keyParts.length - 1];
  };

  // Effect to update display name and age when node data changes
  useEffect(() => {
    // Prioritize data.characterJSON from the form as the source of truth
    const formCharJson = nodeRender.form?.getValueIn<CharacterDetailsFromCanvas>('data.characterJSON');
    
    // Access node.data using an assertion to CanvasNodeData for type safety
    const nodeDataObject = (node as any).data as CanvasNodeData | undefined;

    let nameToDisplay = tSafe('characterNode.canvas.defaultName', {defaultValue: '未命名 / Untitled'});
    let ageToDisplay: string | number | null = tSafe('characterNode.canvas.defaultAge', {defaultValue: '未知 / Unknown'});

    if (formCharJson && formCharJson.name) {
      nameToDisplay = formCharJson.name;
    } else if (nodeDataObject?.characterJSON?.name) {
      nameToDisplay = nodeDataObject.characterJSON.name;
    } else if (nodeDataObject?.title) { 
      nameToDisplay = nodeDataObject.title;
    } else if (nodeDataObject?.name) { // Fallback to legacy data.name
      nameToDisplay = nodeDataObject.name;
    }

    if (formCharJson && (formCharJson.age !== undefined && formCharJson.age !== null)) {
      ageToDisplay = formCharJson.age;
    } else if (nodeDataObject?.characterJSON && (nodeDataObject.characterJSON.age !== undefined && nodeDataObject.characterJSON.age !== null) ) {
      ageToDisplay = nodeDataObject.characterJSON.age;
    } else if (nodeDataObject && (nodeDataObject.age !== undefined && nodeDataObject.age !== null) ) { // Fallback to legacy data.age
       ageToDisplay = nodeDataObject.age;
    } 
    
    setDisplayName(nameToDisplay);
    setDisplayAge(ageToDisplay === null || ageToDisplay === undefined ? tSafe('characterNode.canvas.defaultAge', {defaultValue: '未知 / Unknown'}) : ageToDisplay);

    // For the dependency array, stringifying node.data is one way to react to its changes.
    // Alternatively, if node.onDataChange is available and preferred, that's better.
    // Given the existing form subscription, this effect primarily handles initial load and external node.data changes.
  }, [nodeRender.form, (node as any).data, node.id, tSafe]); // Use node.id and (node as any).data

  // Listen to form changes to update canvas if characterJSON is modified in the sidebar
  useEffect(() => {
    if (!nodeRender.form) return;
    const dispose = nodeRender.form.onFormValuesChange(() => {
      const formCharJson = nodeRender.form?.getValueIn<CharacterDetailsFromCanvas>('data.characterJSON');
      if (formCharJson) {
        setDisplayName(formCharJson.name || tSafe('characterNode.canvas.defaultName', {defaultValue: '未命名 / Untitled'}));
        setDisplayAge(formCharJson.age !== undefined && formCharJson.age !== null ? formCharJson.age : tSafe('characterNode.canvas.defaultAge', {defaultValue: '未知 / Unknown'}));
      }
    });
    return () => dispose.dispose();
  }, [nodeRender.form, tSafe]);


  return (
    <NodeRenderContext.Provider value={nodeRender}>
      <NodeWrapper>
        <div
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            background: '#f9f9f9',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex', // Added for centering
            flexDirection: 'column', // Added for centering
            justifyContent: 'center', // Added for centering
            alignItems: 'center', // Added for centering
            textAlign: 'center', // Ensure text is centered
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{displayName}</div>
          <div style={{ color: '#666', fontSize: 12 }}>
            {tSafe('characterNode.canvas.ageLabel', {defaultValue: '年龄 / Age'})}: {String(displayAge)}
          </div>
          {/* Removed the button and save message */}
        </div>
      </NodeWrapper>
    </NodeRenderContext.Provider>
  );
};
