import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';

interface LLMEditorProps {
  node: Node;
}

export const LLMEditor: React.FC<LLMEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [llmConfig, setLlmConfig] = useState(node.data.config || {
    modelName: 'GPT-4',
    apiKey: '',
    baseURL: '',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    outputFormat: 'structured',
    parameters: {}
  });

  const handleConfigChange = (newConfig: any) => {
    setLlmConfig(newConfig);
    updateNodeData(node.id, {
      config: newConfig,
      modelName: newConfig.modelName,
      apiKey: !!newConfig.apiKey
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const configData = JSON.parse(e.target?.result as string);
          handleConfigChange(configData);
        } catch (error) {
          alert('配置文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportConfig = () => {
    const configStr = JSON.stringify(llmConfig, null, 2);
    const configBlob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(configBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `llm-config-${llmConfig.modelName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    updateNodeData(node.id, { isGenerating: true });
    
    // 模拟生成过程
    setTimeout(() => {
      const mockResponse = "这是一个模拟的LLM响应。在实际应用中，这里会调用真实的API来生成内容。";
      updateNodeData(node.id, { 
        isGenerating: false,
        lastResponse: mockResponse,
        lastGeneratedAt: new Date().toISOString()
      });
    }, 3000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">LLM 配置</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            导入
          </button>
          <button
            onClick={handleExportConfig}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            导出
          </button>
          <button
            onClick={handleGenerate}
            disabled={node.data.isGenerating}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
          >
            {node.data.isGenerating ? '生成中...' : '生成'}
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportConfig}
        accept=".json"
        className="hidden"
      />

      {/* 基本配置快速编辑 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
          <select
            value={llmConfig.modelName || 'GPT-4'}
            onChange={(e) => handleConfigChange({ ...llmConfig, modelName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GPT-4">GPT-4</option>
            <option value="GPT-3.5-Turbo">GPT-3.5-Turbo</option>
            <option value="Claude-3">Claude-3</option>
            <option value="Gemini-Pro">Gemini-Pro</option>
            <option value="Ollama">Ollama (本地)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="password"
            value={llmConfig.apiKey || ''}
            onChange={(e) => handleConfigChange({ ...llmConfig, apiKey: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入API密钥"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">温度值</label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={llmConfig.temperature || 0.7}
              onChange={(e) => handleConfigChange({ 
                ...llmConfig, 
                temperature: parseFloat(e.target.value) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最大tokens</label>
            <input
              type="number"
              min="1"
              max="8000"
              value={llmConfig.maxTokens || 2000}
              onChange={(e) => handleConfigChange({ 
                ...llmConfig, 
                maxTokens: parseInt(e.target.value) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
          <textarea
            value={llmConfig.systemPrompt || ''}
            onChange={(e) => handleConfigChange({ ...llmConfig, systemPrompt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            placeholder="设置LLM的行为和角色"
          />
        </div>
      </div>

      {/* 输出结果显示 */}
      {node.data.lastResponse && (
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">最后生成结果</label>
          <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
            {node.data.lastResponse}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            生成时间: {node.data.lastGeneratedAt && new Date(node.data.lastGeneratedAt).toLocaleString()}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">完整配置</label>
        <JSONEditor
          data={llmConfig}
          onChange={handleConfigChange}
          height="300px"
        />
      </div>
    </div>
  );
};