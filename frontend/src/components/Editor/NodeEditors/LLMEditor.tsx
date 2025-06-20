import React, { useState, useRef, useEffect } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import { configService, LLM_PROVIDERS, type LLMConfig } from '../../../services/configService';
import './CharacterEditor.css';

interface LLMEditorProps {
  node: Node;
}

export const LLMEditor: React.FC<LLMEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(
    node.data.config || configService.getDefaultConfig()
  );

  // 初始化时加载默认配置
  useEffect(() => {
    if (!node.data.config) {
      const defaultConfig = configService.getDefaultConfig();
      setLlmConfig(defaultConfig);
      updateNodeData(node.id, {
        config: defaultConfig,
        provider: defaultConfig.provider,
        model: defaultConfig.model,
        apiKey: !!defaultConfig.apiKey
      });
    }
  }, [node.id, node.data.config, updateNodeData]);

  const handleConfigChange = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig);
    updateNodeData(node.id, {
      config: newConfig,
      provider: newConfig.provider,
      model: newConfig.model,
      apiKey: !!newConfig.apiKey
    });
  };

  const handleProviderChange = (providerId: string) => {
    const providerConfig = configService.getProviderConfig(providerId);
    const newConfig = { ...llmConfig, ...providerConfig };
    handleConfigChange(newConfig);
  };

  const currentProvider = configService.getProvider(llmConfig.provider);
  const availableModels = currentProvider?.models || [];
  const hasEnvApiKey = configService.hasApiKey(llmConfig.provider);
  const effectiveApiKey = hasEnvApiKey ? '已从环境变量配置' : llmConfig.apiKey;

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
    link.download = `llm-config-${llmConfig.model}.json`;
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
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">LLM 配置</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportConfig} className="editor-button">
            导出
          </button>
          <button onClick={handleGenerate} disabled={node.data.isGenerating} className="editor-button editor-button-secondary">
            {node.data.isGenerating ? '生成中...' : '生成'}
          </button>
        </div>
      </div>

      {/* LLM 提供商概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">当前配置</h4>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="overview-label">提供商</span>
            <span className="overview-value">{currentProvider?.name || '未知'}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">模型</span>
            <span className="overview-value">{llmConfig.model}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Temperature</span>
            <span className="overview-value">{llmConfig.temperature.toFixed(1)}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">API密钥</span>
            <span className="overview-value">
              {hasEnvApiKey ? '已从环境变量配置' : (llmConfig.apiKey ? '已手动配置' : '未配置')}
            </span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <div className="form-group-header">
            <h3>提供商设置</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">LLM 提供商</label>
              <select
                value={llmConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="form-select"
              >
                {LLM_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">模型</label>
              <select
                value={llmConfig.model}
                onChange={(e) => handleConfigChange({ ...llmConfig, model: e.target.value })}
                className="form-select"
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {currentProvider?.apiKeyRequired && (
              <div className="form-field">
                <label className="form-label">API 密钥</label>
                {hasEnvApiKey ? (
                  <div className="env-key-display">
                    <input
                      type="text"
                      value="已从环境变量配置"
                      className="form-input"
                      disabled
                      style={{ color: '#28a745', fontWeight: 'bold' }}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      API密钥已在环境变量中配置，无需手动输入
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="password"
                      value={llmConfig.apiKey || ''}
                      onChange={(e) => handleConfigChange({ ...llmConfig, apiKey: e.target.value })}
                      className="form-input"
                      placeholder="输入 API 密钥"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      请输入API密钥后才能使用此LLM服务
                    </div>
                  </>
                )}
              </div>
            )}

            {currentProvider?.baseUrlRequired && (
              <div className="form-field">
                <label className="form-label">Base URL</label>
                <input
                  type="url"
                  value={llmConfig.baseUrl || ''}
                  onChange={(e) => handleConfigChange({ ...llmConfig, baseUrl: e.target.value })}
                  className="form-input"
                  placeholder={currentProvider.defaultBaseUrl}
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>模型参数</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">Temperature: {llmConfig.temperature.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={llmConfig.temperature}
                onChange={(e) => handleConfigChange({ ...llmConfig, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>精确 (0.0)</span>
                <span>创意 (1.0)</span>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">最大 Token 数</label>
              <input
                type="number"
                min="1"
                max="8000"
                value={llmConfig.maxTokens}
                onChange={(e) => handleConfigChange({ ...llmConfig, maxTokens: parseInt(e.target.value) })}
                className="form-input"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>提示词设置</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">系统提示词</label>
              <textarea
                value={llmConfig.systemPrompt || ''}
                onChange={(e) => handleConfigChange({ ...llmConfig, systemPrompt: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportConfig}
        accept=".json"
        className="hidden-file-input"
      />

      {/* 输出结果显示 */}
      {node.data.lastResponse && (
        <div className="form-group">
          <div className="form-group-header">
            <h3>生成结果</h3>
          </div>
          <div className="form-group-content">
            <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
              {node.data.lastResponse}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              生成时间: {node.data.lastGeneratedAt && new Date(node.data.lastGeneratedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="form-group">
        <div className="form-group-header">
          <h3>完整配置 (JSON)</h3>
        </div>
        <div className="form-group-content">
          <JSONEditor
            data={llmConfig}
            onChange={handleConfigChange}
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};