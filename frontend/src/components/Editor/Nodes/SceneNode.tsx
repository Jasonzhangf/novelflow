import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

export const SceneNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  const sceneName = data.sceneName || data.label || '序章';
  const characterCount = data.characters?.length || 0;
  const hasEnvironment = !!data.environment;
  const summary = data.summary || data.sceneData?.summary || '';

  const configItems = [
    { label: '场景名称', value: sceneName, key: 'sceneName' },
    { label: '关联角色', value: `${characterCount} 个`, key: 'characters' },
    { label: '环境设定', value: hasEnvironment ? '已设置' : '未设置', key: 'environment' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit scene:', key);
  };

  return (
    <BaseNode
      title="场景节点"
      icon="🎬"
      id={id}
      nodeType="scene"
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
        
        {summary && (
          <div className="bg-white border-2 border-gray-300 rounded-md p-2 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">
              摘要
            </div>
            <div className="text-xs text-gray-800">
              {summary.length > 60 ? `${summary.substring(0, 60)}...` : summary}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};