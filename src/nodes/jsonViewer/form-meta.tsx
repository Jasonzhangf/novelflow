import React from 'react';
import { FormRenderProps, FlowNodeJSON } from '@flowgram.ai/free-layout-editor'; // Using types from the layout editor

/**
 * @en Renders the form for the JSON Viewer node's settings panel.
 * @cn 渲染JSON查看器节点设置面板的表单。
 * @param props - Properties for rendering the form, includes the form model.
 * @returns {JSX.Element}
 */
export const renderJsonViewerForm = (props: FormRenderProps<FlowNodeJSON>): JSX.Element => {
  const { form } = props; // Destructure form from props

  // Access the jsonData from the input port named 'jsonDataIn'
  // The workflow engine should place the output of the connected node here.
  const receivedJson = form.getValueIn('data.inputsValues.jsonDataIn');
  let displayJson = '';

  if (receivedJson !== undefined && receivedJson !== null) {
    try {
      displayJson = JSON.stringify(receivedJson, null, 2); // Pretty print the JSON
    } catch (error) {
      displayJson = 'Error formatting JSON / JSON格式化错误';
      console.error('Error formatting JSON for display:', error);
    }
  } else {
    displayJson = 'No JSON data received or input not connected / 未收到JSON数据或输入未连接';
  }

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