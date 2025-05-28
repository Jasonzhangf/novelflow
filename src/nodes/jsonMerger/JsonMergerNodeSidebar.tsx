/**
 * @en Sidebar component for the JSON Merger node for configuration.
 * @cn JSON合并器节点的侧边栏配置组件。
 */
import React, { useEffect } from 'react';
import { NodeRenderProps, useNodeRender, useRefresh } from '@flowgram.ai/free-layout-editor';
import { JsonMergerNodeData } from './jsonMergerNode'; // Import the data structure

// Assuming a simple sidebar for now, mainly displaying info or basic settings.
// If complex settings like dynamically changing the number of inputs are needed,
// this component would become more complex.

export const JsonMergerNodeSidebar: React.FC<NodeRenderProps<JsonMergerNodeData>> = ({ node }) => {
  const { form: nodeForm, save } = useNodeRender(); // Use useNodeRender to get form and save
  const refresh = useRefresh();
  const nodeId = node.id;

  // Effect to refresh sidebar if node data changes externally
  useEffect(() => {
    const dispose = node.onDataChange(() => {
      console.log('[JsonMergerNodeSidebar ' + nodeId + '] node.onDataChange triggered. Refreshing sidebar.');
      refresh(); // This causes the sidebar to re-render and pick up new node.data
    });
    return () => dispose.dispose();
  }, [node, refresh, nodeId]);

  // Get current values for display. For a simple node, these might be static or reflect titles/descriptions.
  const currentData = node.data as JsonMergerNodeData;
  const title = nodeForm?.getValue('data.title') || currentData?.title || 'JSON Merger / JSON 合并器';
  const description = nodeForm?.getValue('data.description') || currentData?.description || '';
  const numberOfInputs = currentData?.numberOfInputs || 5; // Now default to 5

  // Handler for title change
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    nodeForm?.setValue('data.title', event.target.value);
    // Optionally, call save() if changes should be persisted immediately
    // save(); 
  };

  // Handler for description change
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    nodeForm?.setValue('data.description', event.target.value);
    // save();
  };
  
  // In a more complex sidebar, you might allow changing `numberOfInputs`
  // const handleNumberOfInputsChange = (newNumber: number) => {
  //   // This would require updating node definition (inputs array) and then potentially node.data
  //   // And then triggering a save or a specific update mechanism.
  //   // For now, it's fixed.
  //   console.log('[JsonMergerNodeSidebar ' + nodeId + '] Number of inputs change requested to: ' + newNumber + ' (not implemented)');
  // };

  if (!nodeForm) {
    return <div>Loading sidebar... / 侧边栏加载中...</div>;
  }

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginTop: 0, marginBottom: '12px' }}>JSON Merger Settings / JSON合并器设置</h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor={`title-\${nodeId}`} style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Node Title / 节点标题:
        </label>
        <input 
          type="text" 
          id={`title-\${nodeId}`}
          value={title}
          onChange={handleTitleChange}
          onBlur={() => save()} // Save when focus is lost
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label htmlFor={`description-\${nodeId}`} style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Node Description / 节点描述:
        </label>
        <textarea 
          id={`description-\${nodeId}`}
          value={description}
          onChange={handleDescriptionChange}
          onBlur={() => save()} // Save when focus is lost
          rows={3}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '0.9em' }}>Node Information / 节点信息</h4>
        <p style={{ fontSize: '0.85em', margin: '4px 0' }}><strong>Type / 类型:</strong> JSON Merger</p>
        <p style={{ fontSize: '0.85em', margin: '4px 0' }}><strong>ID:</strong> {nodeId}</p>
        <p style={{ fontSize: '0.85em', margin: '4px 0' }}><strong>Inputs / 输入端口数:</strong> {numberOfInputs} (jsonDataIn1, jsonDataIn2, jsonDataIn3, jsonDataIn4, jsonDataIn5)</p>
        <p style={{ fontSize: '0.85em', margin: '4px 0' }}><strong>Output / 输出端口:</strong> mergedJsonData (Array)</p>
      </div>
      
      {/* 
      Button to save changes manually if not using onBlur or auto-save logic 
      <button 
        onClick={() => save()} 
        style={{ padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Save Settings / 保存设置
      </button>
      */}

      <p style={{ fontSize: '0.8em', color: '#777', marginTop: '16px' }}>
        This node merges up to {numberOfInputs} JSON inputs (jsonDataIn1, jsonDataIn2, jsonDataIn3, jsonDataIn4, jsonDataIn5) into a single array named 'mergedJsonData'.
        <br />
        该节点将最多 {numberOfInputs} 个JSON输入 (jsonDataIn1, jsonDataIn2, jsonDataIn3, jsonDataIn4, jsonDataIn5) 合并为一个名为 'mergedJsonData' 的数组。
      </p>
    </div>
  );
};
