import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

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

  // 获取环境概览信息
  const getEnvironmentOverview = () => {
    const overview: { [key: string]: string } = {};
    
    if (environmentData.environmentName) overview['环境名称'] = environmentData.environmentName;
    if (environmentData.timeOfDay) overview['时间'] = environmentData.timeOfDay;
    if (environmentData.season) overview['季节'] = environmentData.season;
    if (environmentData.weather) overview['天气'] = environmentData.weather;
    if (environmentData.temperature) overview['温度'] = environmentData.temperature;
    if (environmentData.lighting) overview['光照'] = environmentData.lighting;
    
    // 感官数量
    if (environmentData.sounds?.length) {
      overview['声音效果'] = `${environmentData.sounds.length} 个`;
    }
    if (environmentData.smells?.length) {
      overview['气味效果'] = `${environmentData.smells.length} 个`;
    }
    
    return overview;
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">环境设定</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportJSON} className="editor-button">
            导出
          </button>
        </div>
      </div>

      {/* 环境概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">环境概览</h4>
        <div className="overview-grid">
          {Object.entries(getEnvironmentOverview()).map(([key, value]) => (
            <div key={key} className="overview-item">
              <span className="overview-label">{key}</span>
              <span className="overview-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden-file-input"
      />

      <div className="form-section">
        <div className="form-group">
          <div className="form-group-header">
            <h3>基本信息</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">环境名称</label>
              <input
                type="text"
                value={environmentData.environmentName || ''}
                onChange={(e) => handleDataChange({ ...environmentData, environmentName: e.target.value })}
                className="form-input"
                placeholder="输入环境名称"
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">地点描述</label>
              <textarea
                value={environmentData.location || ''}
                onChange={(e) => handleDataChange({ ...environmentData, location: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="详细描述环境的地理位置和特征"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>环境条件</h3>
          </div>
          <div className="form-group-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <label className="form-label">时间</label>
                <input
                  type="text"
                  value={environmentData.timeOfDay || ''}
                  onChange={(e) => handleDataChange({ ...environmentData, timeOfDay: e.target.value })}
                  className="form-input"
                  placeholder="如：清晨、正午"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">季节</label>
                <select
                  value={environmentData.season || ''}
                  onChange={(e) => handleDataChange({ ...environmentData, season: e.target.value })}
                  className="form-select"
                >
                  <option value="">选择季节</option>
                  <option value="春季">春季</option>
                  <option value="夏季">夏季</option>
                  <option value="秋季">秋季</option>
                  <option value="冬季">冬季</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <label className="form-label">天气</label>
                <input
                  type="text"
                  value={environmentData.weather || ''}
                  onChange={(e) => handleDataChange({ ...environmentData, weather: e.target.value })}
                  className="form-input"
                  placeholder="如：晴朗、多云、雨天"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">光线</label>
                <input
                  type="text"
                  value={environmentData.lighting || ''}
                  onChange={(e) => handleDataChange({ ...environmentData, lighting: e.target.value })}
                  className="form-input"
                  placeholder="如：昏暗、明亮、阴沉"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>氛围与细节</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">氛围描述</label>
              <textarea
                value={environmentData.atmosphere || ''}
                onChange={(e) => handleDataChange({ ...environmentData, atmosphere: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述环境的整体氛围和情绪感受"
              />
            </div>

            <div className="form-field">
              <label className="form-label">视觉细节</label>
              <textarea
                value={environmentData.visualDetails || ''}
                onChange={(e) => handleDataChange({ ...environmentData, visualDetails: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述可见的具体细节，如建筑、植物、物品等"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="form-group-header">
          <h3>完整JSON数据</h3>
        </div>
        <div className="form-group-content">
          <JSONEditor
            data={environmentData}
            onChange={handleDataChange}
            height="400px"
          />
        </div>
      </div>
    </div>
  );
};