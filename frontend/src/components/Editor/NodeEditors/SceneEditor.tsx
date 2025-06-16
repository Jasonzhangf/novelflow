import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';

interface SceneEditorProps {
  node: Node;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sceneData, setSceneData] = useState(node.data.sceneData || {
    sceneName: '',
    summary: '',
    location: '',
    timeOfDay: '',
    weather: '',
    mood: '',
    characters: [],
    environment: null,
    objectives: [],
    constraints: []
  });

  const handleDataChange = (newData: any) => {
    setSceneData(newData);
    updateNodeData(node.id, {
      sceneData: newData,
      sceneName: newData.sceneName,
      summary: newData.summary,
      characters: newData.characters,
      environment: newData.environment
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
    const dataStr = JSON.stringify(sceneData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sceneData.sceneName || 'scene'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">场景设定</h3>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">场景名称</label>
          <input
            type="text"
            value={sceneData.sceneName || ''}
            onChange={(e) => handleDataChange({ ...sceneData, sceneName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入场景名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">场景概要</label>
          <textarea
            value={sceneData.summary || ''}
            onChange={(e) => handleDataChange({ ...sceneData, summary: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            placeholder="描述场景的主要内容和目标"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
            <input
              type="text"
              value={sceneData.location || ''}
              onChange={(e) => handleDataChange({ ...sceneData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="场景地点"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时间</label>
            <input
              type="text"
              value={sceneData.timeOfDay || ''}
              onChange={(e) => handleDataChange({ ...sceneData, timeOfDay: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如：清晨、黄昏"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">天气</label>
            <input
              type="text"
              value={sceneData.weather || ''}
              onChange={(e) => handleDataChange({ ...sceneData, weather: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="天气情况"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">氛围</label>
            <input
              type="text"
              value={sceneData.mood || ''}
              onChange={(e) => handleDataChange({ ...sceneData, mood: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="情绪氛围"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">完整JSON数据</label>
        <JSONEditor
          data={sceneData}
          onChange={handleDataChange}
          height="400px"
        />
      </div>
    </div>
  );
};