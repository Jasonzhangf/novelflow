import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

export const SystemPromptNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  const promptName = data.promptName || data.label || '系统提示词';
  const content = data.content || data.template || '';
  const role = data.role || '';
  const variableCount = data.variables?.length || 0;

  const configItems = [
    { label: '提示名称', value: promptName, key: 'promptName' },
    { label: '角色', value: role || '未设置', key: 'role' },
    { label: '变量数', value: `${variableCount} 个`, key: 'variables' },
    { label: '内容状态', value: content ? '已设置' : '待设置', key: 'content' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit system prompt:', key);
  };

  return (
    <BaseNode
      title="系统提示词"
      icon="⚙️"
      id={id}
      nodeType="systemPrompt"
      onDelete={deleteNode}
      onDuplicate={duplicateNode}
    >
      <div className="space-y-2">
        {configItems.map((item) => (
          <div key={item.key} className="bg-white border-2 border-gray-300 rounded-md p-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-gray-800 truncate" title={String(item.value)}>
                  {String(item.value)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {content && (
          <div className="bg-white border-2 border-gray-300 rounded-md p-2 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">
              预览
            </div>
            <div className="text-xs text-gray-800">
              {content.length > 60 ? `${content.substring(0, 60)}...` : content}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};