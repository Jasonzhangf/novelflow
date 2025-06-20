import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useFlowContext } from '../FlowContext';

interface ConfigItem {
  label: string;
  value: string | number;
  key: string;
}

export const LLMNode: React.FC<NodeProps> = ({ data, id }) => {
  const { deleteNode, duplicateNode } = useFlowContext();
  
  // 从config中读取LLM配置，如果没有config则使用旧格式
  const config = data.config || {};
  const provider = data.provider || config.provider || 'gemini';
  const model = data.model || config.model || 'gemini-2.5-flash-preview-05-20';
  const temperature = data.temperature || config.temperature || 0.7;
  const apiKeyConfigured = data.apiKey || config.apiKey || false;
  const maxTokens = config.maxTokens || 2000;
  const result = data.result || config.result || '';

  const configItems: ConfigItem[] = [
    { label: '提供商', value: provider, key: 'provider' },
    { label: '模型', value: model, key: 'model' },
    { label: 'Temperature', value: temperature.toFixed(1), key: 'temperature' },
    { label: 'API密钥', value: apiKeyConfigured ? '已配置' : '未配置', key: 'apiKey' },
  ];

  const handleEdit = (key: string) => {
    // TODO: 实现编辑功能
    console.log('Edit:', key);
  };

  return (
    <BaseNode
      title="LLM"
      icon="🤖"
      id={id}
      nodeType="llm"
      onDelete={deleteNode}
      onDuplicate={duplicateNode}
    >
      <div className="space-y-3">
        {configItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between group">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium w-20 flex-shrink-0">
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
        
        {/* Result section */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-medium w-20 flex-shrink-0">
              result
            </span>
            <div className="flex-1 text-xs text-gray-600 italic">
              {result || ''}
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};