import React from 'react';
import { type Node } from 'reactflow';
import { CharacterEditor } from './NodeEditors/CharacterEditor';
import { SceneEditor } from './NodeEditors/SceneEditor';
import { LLMEditor } from './NodeEditors/LLMEditor';
import { EnvironmentEditor } from './NodeEditors/EnvironmentEditor';
import { SystemPromptEditor } from './NodeEditors/SystemPromptEditor';
import { UserPromptEditor } from './NodeEditors/UserPromptEditor';

interface SidebarProps {
  selectedNode: Node | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="w-96 bg-gray-50 border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-20">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">选择一个节点</h3>
          <p className="text-sm">点击画布中的节点来编辑其属性</p>
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
    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedNode.data.label || '节点编辑'}
          </h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">ID: {selectedNode.id}</p>
      </div>
      {renderEditor()}
    </div>
  );
};