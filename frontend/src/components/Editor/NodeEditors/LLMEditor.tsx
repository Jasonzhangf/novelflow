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
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold text-dark-text-primary">LLM 配置</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="modelType" className="block text-sm font-medium text-dark-text-secondary mb-1">模型类型</label>
          <select
            id="modelType"
            value={llmConfig.modelName || 'GPT-4'}
            onChange={(e) => handleConfigChange({ ...llmConfig, modelName: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
          >
            <option value="GPT-4">GPT-4</option>
            <option value="GPT-3.5-Turbo">GPT-3.5 Turbo</option>
            <option value="Claude-3">Claude-3</option>
            <option value="Gemini-Pro">Gemini-Pro</option>
            <option value="Ollama">Ollama (本地)</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-dark-text-secondary mb-1">
            Temperature: {llmConfig.temperature?.toFixed(1) || '0.5'}
          </label>
          <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={llmConfig.temperature || 0.5}
            onChange={(e) => handleConfigChange({ ...llmConfig, temperature: parseFloat(e.target.value) })}
            className="w-full h-2 bg-dark-input rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">系统提示词</label>
          <textarea
            value={llmConfig.systemPrompt || ''}
            onChange={(e) => handleConfigChange({ ...llmConfig, systemPrompt: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-24 resize-none"
            placeholder="You are an AI assistant."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">输入模板</label>
          <input
            type="text"
            value={llmConfig.promptTemplate || ''}
            onChange={(e) => handleConfigChange({ ...llmConfig, promptTemplate: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            placeholder="例如：'Translate the following text to French: {{text}}'"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
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

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportConfig}
        accept=".json"
        className="hidden"
      />

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