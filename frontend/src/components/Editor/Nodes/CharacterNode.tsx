import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const CharacterNode: React.FC<NodeProps> = ({ data }) => {
  const characterName = data.name || data.characterName || '未命名角色';
  const age = data.age || data.characterData?.age;
  const occupation = data.occupation || data.characterData?.background?.occupation;

  return (
    <BaseNode
      title={characterName}
      subtitle="角色节点"
      icon="👤"
      color="green"
    >
      <div className="space-y-2 text-xs text-gray-600">
        {age && (
          <div className="flex justify-between">
            <span>年龄:</span>
            <span className="font-medium">{age} 岁</span>
          </div>
        )}
        {occupation && (
          <div className="flex justify-between">
            <span>职业:</span>
            <span className="font-medium text-right max-w-24 truncate" title={occupation}>
              {occupation}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>状态:</span>
          <span className={`font-medium ${data.characterData ? 'text-green-600' : 'text-orange-500'}`}>
            {data.characterData ? '已配置' : '待配置'}
          </span>
        </div>
      </div>
    </BaseNode>
  );
};