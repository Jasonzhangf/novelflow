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
      </div>
    </BaseNode>
  );
};