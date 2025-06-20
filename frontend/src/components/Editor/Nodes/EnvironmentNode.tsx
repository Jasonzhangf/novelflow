import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

export const EnvironmentNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
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
      icon="🌍"
      id={id}
      nodeType="environment"
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