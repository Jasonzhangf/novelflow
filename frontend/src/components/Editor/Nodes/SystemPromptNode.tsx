import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const SystemPromptNode: React.FC<NodeProps> = ({ data }) => {
  const promptName = data.promptName || '系统提示词';
  const hasContent = !!data.content || !!data.template;
  const variableCount = data.variables?.length || 0;

  return (
    <BaseNode
      title={promptName}
      subtitle="系统提示词"
      icon="⚙️"
      color="gray"
    >
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>内容状态:</span>
          <span className={`font-medium ${hasContent ? 'text-green-600' : 'text-orange-500'}`}>
            {hasContent ? '已设置' : '待设置'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>变量数:</span>
          <span className="font-medium">{variableCount} 个</span>
        </div>
        {data.role && (
          <div className="flex justify-between">
            <span>角色:</span>
            <span className="font-medium text-right max-w-24 truncate" title={data.role}>
              {data.role}
            </span>
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