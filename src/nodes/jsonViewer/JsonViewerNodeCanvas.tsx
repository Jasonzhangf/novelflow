import React from 'react';
import { NodeRenderProps } from '@flowgram.ai/free-layout-editor'; // Using the project's layout editor types
// import iconJsonViewerPlaceholder from '../../assets/icon-default.png'; // Placeholder
import iconJsonViewerPlaceholder from '../../assets/icon-llm.jpg'; // Using a common placeholder icon

/**
 * @en Canvas component for the JSON Viewer node.
 * @cn JSON查看器节点的画布组件。
 * @param {NodeRenderProps} props - Properties passed by the layout editor.
 * @returns {JSX.Element}
 */
export const JsonViewerNodeCanvas: React.FC<NodeRenderProps> = ({ node }) => {
  // Assuming node.data.title is available from the onAdd method
  const title = (node as any).data?.title || 'JSON Viewer / JSON 查看器'; 

  // Basic styling for the node on the canvas
  const nodeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: '10px',
    border: '1px solid #A0A0A0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
    marginBottom: '5px',
  };

  const infoStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#555',
  };

  return (
    <div style={nodeStyle}>
      <div style={titleStyle}>{title}</div>
      {/* Icon could be displayed here if desired, e.g., <img src={iconJsonViewerPlaceholder} alt="icon" style={{ width: 24, height: 24, marginBottom: '5px' }} /> */}
      <div style={infoStyle}>
        {/* 
          * @en Display basic info. The actual JSON is shown in the form.
          * @cn 显示基本信息。实际的JSON内容在表单中显示。
          */}
        <p>Input: JSON Data / 输入: JSON数据</p>
      </div>
    </div>
  );
}; 