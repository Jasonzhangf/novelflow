import React from 'react';
import { type NodeProps } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode: React.FC<NodeProps> = ({ data }) => {
  const modelName = data.modelName || 'GPT-4';
  const isConfigured = !!data.apiKey || !!data.config;
  const lastResponse = data.lastResponse;
  const isGenerating = data.isGenerating || false;

  return (
    <BaseNode
      title="LLM 生成"
      subtitle={modelName}
      icon="🤖"
      color="purple"
      showSource={false}
    >
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>模型:</span>
          <span className="font-medium">{modelName}</span>
        </div>
        <div className="flex justify-between">
          <span>配置:</span>
          <span className={`font-medium ${isConfigured ? 'text-green-600' : 'text-red-500'}`}>
            {isConfigured ? '已配置' : '未配置'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>状态:</span>
          <span className={`font-medium ${isGenerating ? 'text-blue-600' : 'text-gray-600'}`}>
            {isGenerating ? '生成中...' : '就绪'}
          </span>
        </div>
        {lastResponse && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div className="text-gray-500 mb-1">最后输出:</div>
            <div className="text-gray-700">
              {lastResponse.length > 60 ? `${lastResponse.substring(0, 60)}...` : lastResponse}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
};