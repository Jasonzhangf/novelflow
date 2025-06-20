import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

export const CharacterNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  
  // Extract character data from either direct properties or characterData object
  const characterData = data.characterData || {};
  const characterName = data.name || characterData.name || data.label || '未命名角色';
  const age = data.age || characterData.age || '';
  const occupation = data.occupation || characterData.background?.occupation || '';
  
  // Show key personality traits if available
  const getPersonalityPreview = () => {
    if (!characterData.personality) return '未设置';
    
    const coreTemperament = characterData.personality.CoreTemperament;
    if (!coreTemperament) return '已设置';
    
    // Show top 2 personality traits
    const traits = Object.entries(coreTemperament)
      .map(([key, value]: [string, any]) => `${value.Caption}: ${value.Value}`)
      .slice(0, 2);
    
    return traits.length > 0 ? traits.join(', ') : '已设置';
  };

  const configItems = [
    { label: '角色名称', value: characterName, key: 'name' },
    { label: '年龄', value: age ? `${age} 岁` : '未设置', key: 'age' },
    { label: '职业', value: occupation || '未设置', key: 'occupation' },
    { label: '性格特征', value: getPersonalityPreview(), key: 'personality' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit character:', key);
  };

  return (
    <BaseNode
      title="角色节点"
      icon="👤"
      id={id}
      nodeType="character"
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
      </div>
    </BaseNode>
  );
};