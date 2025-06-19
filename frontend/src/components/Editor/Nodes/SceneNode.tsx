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
              className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </button>
          </div>
        ))}
        
        {summary && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-start space-x-2">
              <span className="text-xs text-gray-500 font-medium w-16 flex-shrink-0">
                摘要
              </span>
              <div className="flex-1 text-xs text-gray-600">
                {summary.length > 60 ? `${summary.substring(0, 60)}...` : summary}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};