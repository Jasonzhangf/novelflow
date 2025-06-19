import React from 'react';
import { type Node } from 'reactflow';
import { CharacterEditor } from './NodeEditors/CharacterEditor';
import { SceneEditor } from './NodeEditors/SceneEditor';
import { LLMEditor } from './NodeEditors/LLMEditor';
import { EnvironmentEditor } from './NodeEditors/EnvironmentEditor';
import { SystemPromptEditor } from './NodeEditors/SystemPromptEditor';
import { UserPromptEditor } from './NodeEditors/UserPromptEditor';
import './NodeEditor.css';

interface NodeEditorProps {
  selectedNode: Node | null;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="sidebar-container">
        <div className="sidebar-placeholder">
          <div className="sidebar-placeholder-icon">📝</div>
          <h3>选择一个节点</h3>
          <p>点击画布中的节点来编辑其属性</p>
        </div>
      </div>
    );
  }

  const renderEditor = () => {
    switch (selectedNode.type) {
      case 'character':
        return <CharacterEditor node={selectedNode} />;
      case 'scene':
        return <SceneEditor node={selectedNode} />;
      case 'llm':
        return <LLMEditor node={selectedNode} />;
      case 'environment':
        return <EnvironmentEditor node={selectedNode} />;
      case 'systemPrompt':
        return <SystemPromptEditor node={selectedNode} />;
      case 'userPrompt':
        return <UserPromptEditor node={selectedNode} />;
      default:
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">未知节点类型</h3>
            <p className="text-gray-600">该节点类型暂未支持编辑</p>
          </div>
        );
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <div className="sidebar-header-title-container">
          <div className="sidebar-header-indicator"></div>
          <h2 className="sidebar-header-title">
            {selectedNode.data.label || '节点编辑'}
          </h2>
        </div>
        <p className="sidebar-header-id">ID: {selectedNode.id}</p>
      </div>
      <div className="sidebar-content">
        {renderEditor()}
      </div>
    </div>
  );
};