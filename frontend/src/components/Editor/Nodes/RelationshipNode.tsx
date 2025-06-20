import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

export const RelationshipNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  
  // 从relationshipData中读取人物关系信息
  const relationshipData = data.relationshipData || {};
  const connectedCharacters = data.connectedCharacters || [];
  const relationships = relationshipData.relationships || '';
  const totalRelationships = relationshipData.totalRelationships || 0;

  const configItems = [
    { label: '连接角色', value: connectedCharacters.length > 0 ? `${connectedCharacters.length} 个` : '未连接', key: 'characters' },
    { label: '关系条目', value: totalRelationships > 0 ? `${totalRelationships} 条` : '未设置', key: 'relationships' },
    { label: '内容长度', value: relationships ? `${relationships.length} 字符` : '0 字符', key: 'content' },
  ];

  const handleEdit = (key: string) => {
    console.log('Edit relationship:', key);
  };

  return (
    <BaseNode
      title="人物关系"
      icon="👥"
      id={id}
      nodeType="relationship"
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
        
        {/* 显示连接的角色列表 */}
        {connectedCharacters.length > 0 && (
          <div className="bg-white border-2 border-gray-300 rounded-md p-2 shadow-sm">
            <div className="text-xs text-gray-500 font-medium mb-1">连接的角色</div>
            <div className="flex flex-wrap gap-1">
              {connectedCharacters.slice(0, 3).map((character: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {character}
                </span>
              ))}
              {connectedCharacters.length > 3 && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                  +{connectedCharacters.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};