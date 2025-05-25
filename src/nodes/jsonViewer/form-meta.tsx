import React, { useEffect, useState } from 'react';

import { FormRenderProps, FlowNodeJSON, useScopeAvailable, useNodeRender } from '@flowgram.ai/free-layout-editor'; // Keep useScopeAvailable, Add useNodeRender

/**
 * @en Renders the form for the JSON Viewer node's settings panel.
 * @cn 渲染JSON查看器节点设置面板的表单。
 * @param props - Properties for rendering the form, includes the form model.
 * @returns {JSX.Element}
 */
export const renderJsonViewerForm = (props: FormRenderProps<FlowNodeJSON>): JSX.Element => {
  const { form } = props; // Destructure form from props
  const { node: currentNode } = useNodeRender(); // Get current node instance

  // Add state to force re-render when data changes
  const [displayJson, setDisplayJson] = useState('');

  // Get available variables using the hook (can be kept for other purposes or logging if needed)
  const availableVariables = useScopeAvailable();

  console.log("JSON Viewer available variables:", availableVariables); // Log available variables object
  console.log("JSON Viewer available variables list:", availableVariables.variables); // Log the list of variables

  // Use effect to update displayJson when currentNode data changes
  useEffect(() => {
    console.log("useEffect triggered in JSON Viewer form-meta (triggered by currentNode data change)");
    
    let dataToDisplay = undefined;
    if (currentNode && (currentNode as any).data && (currentNode as any).data.inputsValues) {
      dataToDisplay = (currentNode as any).data.inputsValues.jsonDataIn;
      console.log("JSON Viewer form: Reading data directly from currentNode.data.inputsValues.jsonDataIn:", dataToDisplay);
    } else {
      console.log("JSON Viewer form: currentNode, data, or inputsValues not available, or jsonDataIn is not set.");
    }

    let formattedJson = '';
    if (dataToDisplay !== undefined && dataToDisplay !== null) {
      try {
        // If it's a string, display as is. Otherwise, stringify.
        if (typeof dataToDisplay === 'string') {
          formattedJson = dataToDisplay;
        } else {
          formattedJson = JSON.stringify(dataToDisplay, null, 2); // Pretty print the JSON
        }
      } catch (error) {
        formattedJson = 'Error formatting JSON / JSON格式化错误';
        console.error('Error formatting JSON for display:', error);
      }
    } else {
      formattedJson = 'No JSON data received or input value not found / 未收到JSON数据或未找到输入值';
    }
    setDisplayJson(formattedJson);

  }, [currentNode, (currentNode as any)?.data?.inputsValues?.jsonDataIn]); // Depend on currentNode and the specific data path

  // Styling for the JSON display area
  const preStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    padding: '10px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '400px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '13px',
  };

  const containerStyle: React.CSSProperties = {
    padding: '10px',
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: '8px',
    display: 'block',
    fontWeight: 'bold',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <label htmlFor="json-display" style={labelStyle}>
        Received JSON Data / 接收到的JSON数据 (from input 'jsonDataIn'):
      </label>
      <pre id="json-display" style={preStyle}>
        {displayJson}
      </pre>
      {/*
       * @en This node is for display only.
       * @cn 此节点仅用于显示。
       */}
    </div>
  );
};
