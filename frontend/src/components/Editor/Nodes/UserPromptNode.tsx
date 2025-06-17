import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const UserPromptNode: React.FC<NodeProps> = ({ data }) => {
  const promptName = data.promptName || data.label || '用户提示词';
  const content = data.content || data.chapterSummary || '';
  const chapterType = data.chapterType || '';
  const wordCount = content ? content.length : 0;

  const configItems = [
    { label: '提示名称', value: promptName, key: 'promptName' },
    { label: '章节类型', value: chapterType || '未设置', key: 'chapterType' },
    { label: '字数', value: `${wordCount} 字`, key: 'content' },
    { label: '内容状态', value: content ? '已设置' : '待设置', key: 'status' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit user prompt:', key);
  };

  return (
    <BaseNode
      title="用户提示词"
      subtitle={promptName}
      icon="📝"
      color="purple"
    >
      <div className="space-y-3">
        {configItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between group">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium w-16 flex-shrink-0">
                  {item.label}
                </span>
                <span className="text-xs text-gray-800 flex-1 truncate" title={String(item.value)}>
                  {String(item.value)}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleEdit(item.key)}
              className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        ))}
        
        {content && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-start space-x-2">
              <span className="text-xs text-gray-500 font-medium w-16 flex-shrink-0">
                预览
              </span>
              <div className="flex-1 text-xs text-gray-600">
                {content.length > 60 ? `${content.substring(0, 60)}...` : content}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};