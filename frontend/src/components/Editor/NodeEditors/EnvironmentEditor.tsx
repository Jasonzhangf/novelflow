import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';

interface EnvironmentEditorProps {
  node: Node;
}

export const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [environmentData, setEnvironmentData] = useState(node.data.environmentData || {
    environmentName: '',
    location: '',
    timeOfDay: '',
    season: '',
    weather: '',
    temperature: '',
    lighting: '',
    sounds: [],
    smells: [],
    visualDetails: '',
    atmosphere: '',
    culturalContext: ''
  });

  const handleDataChange = (newData: any) => {
    setEnvironmentData(newData);
    updateNodeData(node.id, {
      environmentData: newData,
      environmentName: newData.environmentName,
      location: newData.location,
      timeOfDay: newData.timeOfDay,
      weather: newData.weather
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
    const dataStr = JSON.stringify(environmentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${environmentData.environmentName || 'environment'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-dark-text-primary">环境设定</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
          >
            导入
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1 bg-dark-input text-dark-text-primary rounded text-sm hover:bg-dark-hover border border-dark-border"
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">环境名称</label>
          <input
            type="text"
            value={environmentData.environmentName || ''}
            onChange={(e) => handleDataChange({ ...environmentData, environmentName: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            placeholder="输入环境名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">地点描述</label>
          <textarea
            value={environmentData.location || ''}
            onChange={(e) => handleDataChange({ ...environmentData, location: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-24 resize-none"
            placeholder="详细描述环境的地理位置和特征"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">时间</label>
            <input
              type="text"
              value={environmentData.timeOfDay || ''}
              onChange={(e) => handleDataChange({ ...environmentData, timeOfDay: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="如：清晨、正午"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">季节</label>
            <select
              value={environmentData.season || ''}
              onChange={(e) => handleDataChange({ ...environmentData, season: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            >
              <option value="">选择季节</option>
              <option value="春季">春季</option>
              <option value="夏季">夏季</option>
              <option value="秋季">秋季</option>
              <option value="冬季">冬季</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">天气</label>
            <input
              type="text"
              value={environmentData.weather || ''}
              onChange={(e) => handleDataChange({ ...environmentData, weather: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="如：晴朗、多云、雨天"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">光线</label>
            <input
              type="text"
              value={environmentData.lighting || ''}
              onChange={(e) => handleDataChange({ ...environmentData, lighting: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="如：昏暗、明亮、阴沉"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">氛围描述</label>
          <textarea
            value={environmentData.atmosphere || ''}
            onChange={(e) => handleDataChange({ ...environmentData, atmosphere: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-24 resize-none"
            placeholder="描述环境的整体氛围和情绪感受"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">视觉细节</label>
          <textarea
            value={environmentData.visualDetails || ''}
            onChange={(e) => handleDataChange({ ...environmentData, visualDetails: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-24 resize-none"
            placeholder="描述可见的具体细节，如建筑、植物、物品等"
          />
        </div>
      </div>

      <div className="border-t border-dark-border pt-4">
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">完整JSON数据</label>
        <JSONEditor
          data={environmentData}
          onChange={handleDataChange}
          height="400px"
        />
      </div>
    </div>
  );
};