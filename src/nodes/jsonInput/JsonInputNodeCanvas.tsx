import React, { useEffect } from 'react';
import { NodeRenderProps, useNodeRender, useRefresh } from '@flowgram.ai/free-layout-editor';

// Assuming you will add an icon, e.g., icon-json.png in the assets folder
// For now, we use a common placeholder or remove if node icon is sufficient
// import iconJsonInputPlaceholder from '../../assets/icon-llm.jpg'; 

/**
 * @en Canvas component for the JSON Input node.
 * @cn JSON输入节点的画布组件。
 * @param {NodeRenderProps} props - Properties passed by the layout editor.
 * @returns {JSX.Element}
 */
export const JsonInputNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  const nodeId = node.id;
  // console.log(`---- [JsonInputNodeCanvas ${nodeId}] COMPONENT BODY RE-EVALUATED ----`);

  const refresh = useRefresh();
  // const { form: nodeForm } = useNodeRender(); // Not directly used here, data comes from node.data

  // Node data contains title, jsonData, and displayProperties calculated by JsonInputNode entity
  const nodeData = (node as any).data || {};
  const title = nodeData.title || 'JSON Input / JSON输入';
  const displayProperties: { key: string, value: any, chineseKey?: string }[] = nodeData.displayProperties || [];
  const jsonData = nodeData.jsonData || {};

  useEffect(() => {
    // console.log(`[JsonInputNodeCanvas ${nodeId}] Subscribing to props.node.onDataChange. Node ID: ${node.id}`);
    const dispose = node.onDataChange(() => {
      // console.log(`[JsonInputNodeCanvas ${nodeId}] <<< props.node.onDataChange triggered! >>>`);
      // const currentPropsNodeData = (node as any).data;
      // console.log(`[JsonInputNodeCanvas ${nodeId}] Data from event:`, currentPropsNodeData ? JSON.stringify(currentPropsNodeData, null, 2) : 'undefined');
      refresh(); // Refresh the component when node data changes
    });
    return () => {
      // console.log(`[JsonInputNodeCanvas ${nodeId}] Unsubscribing from props.node.onDataChange. Node ID: ${node.id}`);
      dispose.dispose();
    };
  }, [node, refresh, nodeId]);

  // console.log(`[JsonInputNodeCanvas ${nodeId}] --- Rendering ---`);
  // console.log(`[JsonInputNodeCanvas ${nodeId}] Title from node.data: ${title}`);
  // console.log(`[JsonInputNodeCanvas ${nodeId}] Display Properties from node.data:`, JSON.stringify(displayProperties));
  // console.log(`[JsonInputNodeCanvas ${nodeId}] Raw jsonData from node.data:`, JSON.stringify(jsonData));

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '10px',
      border: '1px solid #767676', // Standard border color
      borderRadius: '4px',
      backgroundColor: '#ffffff', // Standard background
      boxSizing: 'border-box',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Optional: Icon within the canvas node itself */}
      {/* <img src={iconJsonInputPlaceholder} alt="JSON" style={{ width: 16, height: 16, marginRight: 5, opacity: 0.7 }} /> */}
      <div 
        style={{ 
          fontWeight: 'bold', 
          marginBottom: '8px', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          fontSize: '14px', // Standard title font size
          color: '#333',    // Standard title color
        }}
        title={title} // Show full title on hover
      >
        {title}
      </div>
      <div style={{ fontSize: '12px', color: '#555', flexGrow: 1, overflowY: 'auto' }}>
        {displayProperties.length > 0 ? (
          displayProperties.map((prop, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '4px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}
              title={`${prop.chineseKey || prop.key}: ${typeof prop.value === 'string' ? prop.value : JSON.stringify(prop.value)}`}
            >
              <strong style={{color: '#333'}}>{prop.chineseKey || prop.key}:</strong>&nbsp;
              <span>
                {typeof prop.value === 'string' ? prop.value : JSON.stringify(prop.value)}
              </span>
            </div>
          ))
        ) : (
          Object.keys(jsonData).length === 0 || (jsonData.hasOwnProperty('error')) ? 
            (<div style={{ fontStyle: 'italic', color: jsonData.hasOwnProperty('error') ? 'red' : '#777' }}>
              {jsonData.hasOwnProperty('error') ? (jsonData as any).error : 'No JSON data / 无JSON数据'}
            </div>) :
            (<div style={{ fontStyle: 'italic', color: '#777' }}>Loading data... / 正在加载...</div>)
        )}
      </div>
      {/* Optional: Display Node ID for debugging */}
      {/* 
      <div style={{ marginTop: 'auto', fontSize: '10px', color: '#aaa', paddingTop: '5px' }}>
        ID: {nodeId}
      </div>
      */}
    </div>
  );
};
