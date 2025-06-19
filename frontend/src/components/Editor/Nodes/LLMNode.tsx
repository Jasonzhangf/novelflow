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
  const modelType = data.modelType || 'gpt-3.5-turbo';
  const temperature = data.temperature || 0.5;
  const systemPrompt = data.systemPrompt || 'You are an AI assistant.';
  const prompt = data.prompt || 'Please Input String';
  const result = data.result || '';

  const configItems: ConfigItem[] = [
    { label: 'modelType', value: modelType, key: 'modelType' },
    { label: 'temperature', value: temperature, key: 'temperature' },
    { label: 'systemPrompt', value: systemPrompt, key: 'systemPrompt' },
    { label: 'prompt', value: prompt, key: 'prompt' },
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