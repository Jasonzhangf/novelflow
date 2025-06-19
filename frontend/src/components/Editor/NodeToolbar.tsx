import React from 'react';
import './NodeToolbar.css';

interface NodeToolbarProps {
  onAddNode: (type: string, position: { x: number, y: number }) => void;
}

const nodeButtons = [
  { type: 'character', label: '角色' },
  { type: 'environment', label: '环境' },
  { type: 'systemPrompt', label: '系统提示' },
  { type: 'userPrompt', label: '用户提示' },
  { type: 'llm', label: 'LLM' },
  { type: 'textOutput', label: '文本输出' },
];

const NODE_POSITION = { x: 200, y: 100 };

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ onAddNode }) => {
  return (
    <div className="node-toolbar">
      <div className="node-toolbar-header">
        <h3 className="node-toolbar-title">节点工具栏</h3>
      </div>
      <div className="node-toolbar-grid">
        {nodeButtons.map(({ type, label }) => (
          <button 
            key={type}
            onClick={() => onAddNode(type, NODE_POSITION)} 
            className="node-toolbar-button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}; 