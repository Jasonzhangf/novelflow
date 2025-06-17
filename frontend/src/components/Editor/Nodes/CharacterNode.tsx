import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const CharacterNode: React.FC<NodeProps> = ({ data }) => {
  const characterName = data.name || data.characterName || data.label || '未命名角色';
  const age = data.age || data.characterData?.age || '';
  const occupation = data.occupation || data.characterData?.background?.occupation || '';
  const personality = data.personality || data.characterData?.personality || '';

  const configItems = [
    { label: '角色名称', value: characterName, key: 'name' },
    { label: '年龄', value: age ? `${age} 岁` : '未设置', key: 'age' },
    { label: '职业', value: occupation || '未设置', key: 'occupation' },
    { label: '性格', value: personality || '未设置', key: 'personality' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit character:', key);
  };

  return (
    <BaseNode
      title="角色节点"
      subtitle={characterName}
      icon="👤"
      color="green"
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
              className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        ))}
      </div>
    </BaseNode>
  );
};