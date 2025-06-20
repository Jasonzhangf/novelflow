import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

export const WorldNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  
  // 从worldData中读取世界设定信息
  const worldData = data.worldData || {};
  const worldName = data.worldName || worldData.worldName || '未命名世界';
  const era = worldData.era || '';
  const geography = worldData.geography || '';
  const culture = worldData.culture || '';
  const technology = worldData.technology || '';

  const configItems = [
    { label: '世界名称', value: worldName, key: 'worldName' },
    { label: '时代', value: era || '未设置', key: 'era' },
    { label: '地理', value: geography || '未设置', key: 'geography' },
    { label: '文化', value: culture || '未设置', key: 'culture' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit world:', key);
  };

  return (
    <BaseNode
      title="世界设定"
      icon="🌍"
      id={id}
      nodeType="world"
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