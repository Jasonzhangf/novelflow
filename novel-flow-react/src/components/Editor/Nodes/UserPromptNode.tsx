import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const UserPromptNode: React.FC<NodeProps> = ({ data }) => {
  const promptName = data.promptName || '用户提示词';
  const hasContent = !!data.content || !!data.chapterSummary;
  const wordCount = data.content ? data.content.length : 0;

  return (
    <BaseNode
      title={promptName}
      subtitle="用户提示词"
      icon="📝"
      color="blue"
    >
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>内容状态:</span>
          <span className={`font-medium ${hasContent ? 'text-green-600' : 'text-orange-500'}`}>
            {hasContent ? '已设置' : '待设置'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>字数:</span>
          <span className="font-medium">{wordCount} 字</span>
        </div>
        {data.chapterType && (
          <div className="flex justify-between">
            <span>章节类型:</span>
            <span className="font-medium">{data.chapterType}</span>
          </div>
        )}
        {data.content && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div className="text-gray-500 mb-1">预览:</div>
            <div className="text-gray-700">
              {data.content.length > 50 ? `${data.content.substring(0, 50)}...` : data.content}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};