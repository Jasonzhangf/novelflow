import React, { useEffect, useState } from 'react';

import { FormRenderProps, FlowNodeJSON, useScopeAvailable, useNodeRender } from '@flowgram.ai/free-layout-editor'; // Keep useScopeAvailable, Add useNodeRender

/**
 * @en Renders the form for the JSON Viewer node's settings panel.
 * @cn 渲染JSON查看器节点设置面板的表单。
 * @param props - Properties for rendering the form, includes the form model.
 * @returns {JSX.Element}
 */
export const renderJsonViewerForm = (props: FormRenderProps<FlowNodeJSON>): JSX.Element => {
  // const { form } = props; // Form is also in props, but useNodeRender is consistent with canvas
  const { form: formInstance, node: currentNode } = useNodeRender(); // Use form from useNodeRender

  // Add state to force re-render when data changes
  const [displayJson, setDisplayJson] = useState('');

  // Get available variables using the hook (can be kept for other purposes or logging if needed)
  const availableVariables = useScopeAvailable();

  // console.log("JSON Viewer form: props", props);
  // console.log("JSON Viewer form: currentNode from useNodeRender()", currentNode);
  // console.log("JSON Viewer form: formInstance from useNodeRender()", formInstance);
  // console.log("JSON Viewer available variables:", availableVariables); // Log available variables object
  // console.log("JSON Viewer available variables list:", availableVariables.variables); // Log the list of variables

  // Use effect to update displayJson when formInstance values change
  useEffect(() => {
    if (!formInstance) {
      console.log("JSON Viewer form: formInstance is not available yet.");
      setDisplayJson('Form not available / 表单不可用');
      return;
    }

    const updateAndFormatDisplayJson = () => {
      // console.log("JSON Viewer form: Attempting to read formInstance.values", formInstance.values);
      // const dataToDisplay = formInstance.values?.inputsValues?.jsonDataIn; // Direct access
      const dataToDisplay = formInstance.getValueIn('inputsValues.jsonDataIn'); // Using getValueIn

      console.log("JSON Viewer form: Reading data via formInstance.getValueIn('inputsValues.jsonDataIn'):", dataToDisplay, "(Type: " + typeof dataToDisplay + ")");

      let formattedJson = '';
      if (dataToDisplay !== undefined && dataToDisplay !== null) {
        try {
          // If it's a string, display as is. Otherwise, stringify.
          if (typeof dataToDisplay === 'string') {
            // Attempt to parse if it looks like a JSON string, otherwise display as is
            try {
              JSON.parse(dataToDisplay); // Check if it's a valid JSON string
              formattedJson = JSON.stringify(JSON.parse(dataToDisplay), null, 2); // Re-stringify to pretty print
            } catch (e) {
              formattedJson = dataToDisplay; // Not a JSON string, display as is
            }
          } else {
            formattedJson = JSON.stringify(dataToDisplay, null, 2); // Pretty print the JSON object
          }
        } catch (error) {
          formattedJson = 'Error formatting JSON / JSON格式化错误';
          console.error('JSON Viewer form: Error formatting JSON for display:', error);
        }
      } else {
        formattedJson = 'No JSON data received or input value not found / 未收到JSON数据或未找到输入值';
      }
      setDisplayJson(formattedJson);
    };

    updateAndFormatDisplayJson(); // Initial update

    // Subscribe to form value changes
    console.log("JSON Viewer form: Subscribing to formInstance.onFormValuesChange");
    const dispose = formInstance.onFormValuesChange(() => {
      console.log("JSON Viewer form: formInstance.onFormValuesChange triggered!");
      updateAndFormatDisplayJson();
    });

    return () => {
      console.log("JSON Viewer form: Unsubscribing from formInstance.onFormValuesChange");
      dispose.dispose();
    };
  }, [formInstance]); // Depend on formInstance

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
