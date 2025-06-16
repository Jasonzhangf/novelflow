import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';

interface SystemPromptEditorProps {
  node: Node;
}

export const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptData, setPromptData] = useState(node.data.promptData || {
    promptName: '系统提示词',
    role: '小说写作助手',
    content: '',
    template: '',
    variables: [],
    constraints: [],
    outputFormat: 'structured',
    language: 'chinese',
    style: 'literary'
  });

  const handleDataChange = (newData: any) => {
    setPromptData(newData);
    updateNodeData(node.id, {
      promptData: newData,
      promptName: newData.promptName,
      role: newData.role,
      content: newData.content,
      template: newData.template,
      variables: newData.variables
    });
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          handleDataChange(jsonData);
        } catch (error) {
          alert('JSON 文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(promptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${promptData.promptName || 'system-prompt'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadDefaultTemplate = () => {
    const defaultTemplate = `你是一位专业的小说写作助手。你的任务是基于提供的角色、环境、场景等信息，创作高质量的小说章节内容。

请遵循以下原则：
1. 保持角色的一致性和个性特征
2. 根据环境设定营造相应的氛围
3. 确保情节的连贯性和逻辑性
4. 使用生动的描写和对话
5. 保持${promptData.language === 'chinese' ? '中文' : '英文'}的表达习惯

输出格式要求：
- 结构化的JSON格式
- 包含章节标题、正文内容、关键情节点
- 字数控制在合理范围内`;

    handleDataChange({
      ...promptData,
      content: defaultTemplate,
      template: defaultTemplate
    });
  };

  const addVariable = () => {
    const newVariable = {
      name: '',
      description: '',
      type: 'string',
      source: '',
      required: true
    };
    handleDataChange({
      ...promptData,
      variables: [...(promptData.variables || []), newVariable]
    });
  };

  const updateVariable = (index: number, field: string, value: any) => {
    const updatedVariables = [...(promptData.variables || [])];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    handleDataChange({ ...promptData, variables: updatedVariables });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = (promptData.variables || []).filter((_: any, i: number) => i !== index);
    handleDataChange({ ...promptData, variables: updatedVariables });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">系统提示词配置</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            导入
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            导出
          </button>
          <button
            onClick={loadDefaultTemplate}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            默认模板
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* 基本信息快速编辑 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">提示词名称</label>
          <input
            type="text"
            value={promptData.promptName || ''}
            onChange={(e) => handleDataChange({ ...promptData, promptName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入提示词名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AI角色设定</label>
          <input
            type="text"
            value={promptData.role || ''}
            onChange={(e) => handleDataChange({ ...promptData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="定义AI的角色，如：专业小说写作助手"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">语言</label>
            <select
              value={promptData.language || 'chinese'}
              onChange={(e) => handleDataChange({ ...promptData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="chinese">中文</option>
              <option value="english">English</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">输出格式</label>
            <select
              value={promptData.outputFormat || 'structured'}
              onChange={(e) => handleDataChange({ ...promptData, outputFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="structured">结构化JSON</option>
              <option value="plain">纯文本</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">系统提示词内容</label>
          <textarea
            value={promptData.content || ''}
            onChange={(e) => handleDataChange({ ...promptData, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            placeholder="输入详细的系统提示词，定义AI的行为、输出格式等..."
          />
        </div>
      </div>

      {/* 变量管理 */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-semibold text-gray-800">提示词变量</h4>
          <button
            onClick={addVariable}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            添加变量
          </button>
        </div>
        
        {promptData.variables?.map((variable: any, index: number) => (
          <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={variable.name || ''}
                onChange={(e) => updateVariable(index, 'name', e.target.value)}
                placeholder="变量名 (如: characterName)"
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <select
                value={variable.type || 'string'}
                onChange={(e) => updateVariable(index, 'type', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="string">字符串</option>
                <option value="object">对象</option>
                <option value="array">数组</option>
              </select>
            </div>
            <input
              type="text"
              value={variable.description || ''}
              onChange={(e) => updateVariable(index, 'description', e.target.value)}
              placeholder="描述 (如: 主角的姓名)"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
            />
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={variable.source || ''}
                onChange={(e) => updateVariable(index, 'source', e.target.value)}
                placeholder="数据源路径 (如: nodes.character1.data.name)"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm mr-2"
              />
              <button
                onClick={() => removeVariable(index)}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">完整JSON配置</label>
        <JSONEditor
          data={promptData}
          onChange={handleDataChange}
          height="300px"
        />
      </div>
    </div>
  );
};