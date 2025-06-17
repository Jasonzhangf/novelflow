import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const EnvironmentNode: React.FC<NodeProps> = ({ data }) => {
  const environmentName = data.environmentName || data.label || '未命名环境';
  const location = data.location || data.environmentData?.location || '';
  const timeOfDay = data.timeOfDay || data.environmentData?.timeOfDay || '';
  const weather = data.weather || data.environmentData?.weather || '';

  const configItems = [
    { label: '环境名称', value: environmentName, key: 'environmentName' },
    { label: '地点', value: location || '未设置', key: 'location' },
    { label: '时间', value: timeOfDay || '未设置', key: 'timeOfDay' },
    { label: '天气', value: weather || '未设置', key: 'weather' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit environment:', key);
  };

  return (
    <BaseNode
      title="环境节点"
      subtitle={environmentName}
      icon="🌍"
      color="yellow"
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
              className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        ))}
      </div>
    </BaseNode>
  );
};