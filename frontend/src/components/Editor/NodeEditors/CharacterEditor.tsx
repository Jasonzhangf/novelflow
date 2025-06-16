import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';

interface CharacterEditorProps {
  node: Node;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [characterData, setCharacterData] = useState(node.data.characterData || {
    name: '',
    age: null,
    background: {
      origin: '',
      occupation: '',
      history: ''
    },
    personality: {},
    relationships: [],
    language: 'chinese'
  });

  const handleDataChange = (newData: any) => {
    setCharacterData(newData);
    updateNodeData(node.id, {
      characterData: newData,
      name: newData.name,
      age: newData.age,
      occupation: newData.background?.occupation
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
    const dataStr = JSON.stringify(characterData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${characterData.name || 'character'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = async () => {
    try {
      const response = await fetch('/Templates/default-character-template.json');
      const template = await response.json();
      handleDataChange(template);
    } catch (error) {
      alert('加载模板失败');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">角色设定</h3>
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
            onClick={loadTemplate}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            模板
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
          <label className="block text-sm font-medium text-gray-700 mb-1">角色名称</label>
          <input
            type="text"
            value={characterData.name || ''}
            onChange={(e) => handleDataChange({ ...characterData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入角色名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
          <input
            type="number"
            value={characterData.age || ''}
            onChange={(e) => handleDataChange({ 
              ...characterData, 
              age: e.target.value ? parseInt(e.target.value) : null 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入年龄"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">职业</label>
          <input
            type="text"
            value={characterData.background?.occupation || ''}
            onChange={(e) => handleDataChange({ 
              ...characterData, 
              background: { 
                ...characterData.background, 
                occupation: e.target.value 
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入职业"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">完整JSON数据</label>
        <JSONEditor
          data={characterData}
          onChange={handleDataChange}
          height="400px"
        />
      </div>
    </div>
  );
};