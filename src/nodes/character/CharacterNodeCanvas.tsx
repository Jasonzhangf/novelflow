import React, { useState } from 'react';

import { NodeRenderProps, useNodeRender, FlowNodeVariableData, ASTFactory } from '@flowgram.ai/free-layout-editor';

import { NodeRenderContext } from '../../context';
import { NodeWrapper } from '../../components/base-node/node-wrapper';

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

export const CharacterNodeCanvas: React.FC<
  NodeRenderProps & { t?: (key: string, options?: any) => string }
> = ({ node, t }) => {
  // 使用 useNodeRender().form?.values 作为数据源，保证响应式同步
  // Use useNodeRender().form?.values as the data source for real-time sync
  const nodeRender = useNodeRender();
  const values = (nodeRender.form?.values as any) || {};
  // 兼容嵌套结构和扁平结构
  // Compatible with both nested and flat structure
  const data = values.data || values;
  // Defensive t function to prevent crashes if not provided, and provide default values.
  const tSafe = (key: string, options?: any) => {
    if (typeof t === 'function') {
      return t(key, options);
    }
    if (options?.defaultValue) {
      return options.defaultValue;
    }
    const keyParts = key.split('.');
    return keyParts[keyParts.length - 1];
  };

  // 本地可编辑状态 Local editable state
  const [editName, setEditName] = useState(data.name || data.title || values.title || '');
  const [editAge, setEditAge] = useState(
    data.age !== undefined && data.age !== null ? data.age : ''
  );
  const [saveMsg, setSaveMsg] = useState('');

  // 保存到节点数据 Save to node data
  const handleSave = () => {
    if (nodeRender.form && nodeRender.form.setValueIn) {
      nodeRender.form.setValueIn('data.name', editName);
      nodeRender.form.setValueIn('data.age', editAge === '' ? null : Number(editAge));
      // fireChange is not needed; setValueIn is sufficient to persist node data in Flowgram
      setSaveMsg('已保存 (Saved)');
      setTimeout(() => setSaveMsg(''), 1200);
    }
  };

  // Function to generate and update output with fixed JSON for debugging
  const handleGenerateJson = () => {
    // Fixed JSON output for debugging
    const fixedGeneratedJson = {
      message: "Hello from Character Node!",
      status: "success",
      nodeId: node.id,
      timestamp: new Date().toISOString(),
    };

    console.log(`Generated FIXED JSON output:`, fixedGeneratedJson);

    // Use FlowNodeVariableData to declare the output variable with a namespace
    const variableData = nodeRender.node.getData(FlowNodeVariableData);

    if (variableData) {
      const outputNamespace = `node_${node.id}_output`; // Use a unique namespace for this node's output
      console.log(`Attempting to declare variable 'jsonDataOut' in namespace '${outputNamespace}' via FlowNodeVariableData`);
      
      try {
        // Construct the VariableDeclaration object
        const variableDeclaration = ASTFactory.createVariableDeclaration({
          meta: {
            title: `Character Node Output JSON (node_${node.id})`,
            description: `JSON data output from Character Node ${node.id}`,
          },
          key: 'jsonDataOut', // Use the output port key as the variable key
          type: ASTFactory.createObject({})         // Assume object type for JSON, adding empty properties
        });

        // Use the two-argument setVar form: setVar(namespace, variableDeclaration)
        variableData.setVar(
          outputNamespace,
          variableDeclaration
        );

        console.log(`Node ${node.id} output variable 'jsonDataOut' declared in namespace '${outputNamespace}' via FlowNodeVariableData.`, variableDeclaration);

      } catch (error) {
        console.error(`Error creating or setting variable data for node ${node.id}:`, error);
      }

    } else {
      console.warn(`FlowNodeVariableData not available for node ${node.id}. Cannot declare/set variable.`);
    }

    // Use form.setValueIn to update the output port value in node.data.outputsValues
    // This value is expected to be propagated to the declared variable in the scope OR directly to connected inputs
    nodeRender.form?.setValueIn('data.outputsValues.jsonDataOut', fixedGeneratedJson);
    console.log(`Node ${node.id} output jsonDataOut updated with fixed data via form.setValueIn.`);

    setSaveMsg('固定JSON生成成功 (Fixed JSON generated successfully)');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  // 只显示顶层 data.name、data.age
  // Only display top-level data.name, data.age
  const characterName = data.name || data.title || values.title || '未命名';
  const characterAge = data.age !== undefined && data.age !== null ? data.age : '未知';

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
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{characterName}</div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
            年龄: {characterAge}
          </div>
          {/* Add a button to trigger JSON generation and saving */}
          <button
            onClick={handleGenerateJson}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            生成固定JSON (Generate Fixed JSON)
          </button>
          {saveMsg && <div style={{ fontSize: '12px', color: 'green', marginTop: '5px' }}>{saveMsg}</div>}
        </div>
      </NodeWrapper>
    </NodeRenderContext.Provider>
  );
};
