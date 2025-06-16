import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const SceneNode: React.FC<NodeProps> = ({ data }) => {
  const sceneName = data.sceneName || '未命名场景';
  const characterCount = data.characters?.length || 0;
  const hasEnvironment = !!data.environment;

  return (
    <BaseNode
      title={sceneName}
      subtitle="场景节点"
      icon="🎬"
      color="blue"
    >
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>关联角色:</span>
          <span className="font-medium">{characterCount} 个</span>
        </div>
        <div className="flex justify-between">
          <span>环境设定:</span>
          <span className={`font-medium ${hasEnvironment ? 'text-green-600' : 'text-red-500'}`}>
            {hasEnvironment ? '已设置' : '未设置'}
          </span>
        </div>
        {data.summary && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            {data.summary.length > 50 ? `${data.summary.substring(0, 50)}...` : data.summary}
          </div>
        )}
      </div>
    </BaseNode>
  );
};