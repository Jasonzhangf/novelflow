import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const EnvironmentNode: React.FC<NodeProps> = ({ data }) => {
  const environmentName = data.environmentName || '未命名环境';
  const location = data.location || data.environmentData?.location;
  const timeOfDay = data.timeOfDay || data.environmentData?.timeOfDay;
  const weather = data.weather || data.environmentData?.weather;

  return (
    <BaseNode
      title={environmentName}
      subtitle="环境节点"
      icon="🌍"
      color="yellow"
    >
      <div className="space-y-2 text-xs text-gray-600">
        {location && (
          <div className="flex justify-between">
            <span>地点:</span>
            <span className="font-medium text-right max-w-24 truncate" title={location}>
              {location}
            </span>
          </div>
        )}
        {timeOfDay && (
          <div className="flex justify-between">
            <span>时间:</span>
            <span className="font-medium">{timeOfDay}</span>
          </div>
        )}
        {weather && (
          <div className="flex justify-between">
            <span>天气:</span>
            <span className="font-medium">{weather}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>状态:</span>
          <span className={`font-medium ${data.environmentData ? 'text-green-600' : 'text-orange-500'}`}>
            {data.environmentData ? '已配置' : '待配置'}
          </span>
        </div>
      </div>
    </BaseNode>
  );
};