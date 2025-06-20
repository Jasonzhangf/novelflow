import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

interface WorldEditorProps {
  node: Node;
}

export const WorldEditor: React.FC<WorldEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [worldData, setWorldData] = useState(node.data.worldData || {
    worldName: '',
    era: '',
    geography: '',
    culture: '',
    technology: '',
    magic: '',
    religion: '',
    politics: '',
    economy: '',
    history: '',
    languages: [],
    races: [],
    factions: [],
    locations: [],
    rules: '',
    notes: ''
  });

  const handleDataChange = (newData: any) => {
    setWorldData(newData);
    updateNodeData(node.id, {
      worldData: newData,
      worldName: newData.worldName,
      era: newData.era,
      geography: newData.geography,
      culture: newData.culture
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
    const dataStr = JSON.stringify(worldData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${worldData.worldName || 'world'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 获取世界概览信息
  const getWorldOverview = () => {
    const overview: { [key: string]: string } = {};
    
    if (worldData.worldName) overview['世界名称'] = worldData.worldName;
    if (worldData.era) overview['时代'] = worldData.era;
    if (worldData.geography) overview['地理环境'] = worldData.geography.substring(0, 20) + '...';
    if (worldData.culture) overview['文化特色'] = worldData.culture.substring(0, 20) + '...';
    if (worldData.technology) overview['科技水平'] = worldData.technology;
    if (worldData.magic) overview['魔法体系'] = worldData.magic.substring(0, 20) + '...';
    
    // 种族和派系数量
    if (worldData.races?.length) {
      overview['种族数量'] = `${worldData.races.length} 个`;
    }
    if (worldData.factions?.length) {
      overview['派系数量'] = `${worldData.factions.length} 个`;
    }
    
    return overview;
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">世界设定</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportJSON} className="editor-button">
            导出
          </button>
        </div>
      </div>

      {/* 世界概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">世界概览</h4>
        <div className="overview-grid">
          {Object.entries(getWorldOverview()).map(([key, value]) => (
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
              <label className="form-label">世界名称</label>
              <input
                type="text"
                value={worldData.worldName || ''}
                onChange={(e) => handleDataChange({ ...worldData, worldName: e.target.value })}
                className="form-input"
                placeholder="输入世界名称"
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">时代背景</label>
              <input
                type="text"
                value={worldData.era || ''}
                onChange={(e) => handleDataChange({ ...worldData, era: e.target.value })}
                className="form-input"
                placeholder="如：中世纪、现代、未来"
              />
            </div>

            <div className="form-field">
              <label className="form-label">科技水平</label>
              <input
                type="text"
                value={worldData.technology || ''}
                onChange={(e) => handleDataChange({ ...worldData, technology: e.target.value })}
                className="form-input"
                placeholder="如：蒸汽时代、魔法科技"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>世界设定</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">地理环境</label>
              <textarea
                value={worldData.geography || ''}
                onChange={(e) => handleDataChange({ ...worldData, geography: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述世界的地理环境、气候、地形等"
              />
            </div>

            <div className="form-field">
              <label className="form-label">文化特色</label>
              <textarea
                value={worldData.culture || ''}
                onChange={(e) => handleDataChange({ ...worldData, culture: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述世界的文化背景、风俗习惯、社会结构等"
              />
            </div>

            <div className="form-field">
              <label className="form-label">魔法体系</label>
              <textarea
                value={worldData.magic || ''}
                onChange={(e) => handleDataChange({ ...worldData, magic: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述魔法的运作原理、限制、流派等（如果有）"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>社会与政治</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">政治制度</label>
              <textarea
                value={worldData.politics || ''}
                onChange={(e) => handleDataChange({ ...worldData, politics: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="描述政治体制、权力结构、统治方式等"
              />
            </div>

            <div className="form-field">
              <label className="form-label">经济体系</label>
              <textarea
                value={worldData.economy || ''}
                onChange={(e) => handleDataChange({ ...worldData, economy: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="描述经济制度、贸易、货币、资源等"
              />
            </div>

            <div className="form-field">
              <label className="form-label">宗教信仰</label>
              <textarea
                value={worldData.religion || ''}
                onChange={(e) => handleDataChange({ ...worldData, religion: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="描述宗教体系、神祇、信仰、仪式等"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>历史与其他</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">历史背景</label>
              <textarea
                value={worldData.history || ''}
                onChange={(e) => handleDataChange({ ...worldData, history: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述重要历史事件、时间线、传说等"
              />
            </div>

            <div className="form-field">
              <label className="form-label">世界规则</label>
              <textarea
                value={worldData.rules || ''}
                onChange={(e) => handleDataChange({ ...worldData, rules: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="描述世界的基本规则、物理法则、特殊规律等"
              />
            </div>

            <div className="form-field">
              <label className="form-label">备注</label>
              <textarea
                value={worldData.notes || ''}
                onChange={(e) => handleDataChange({ ...worldData, notes: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="其他补充信息和设定说明"
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
            data={worldData}
            onChange={handleDataChange}
            height="400px"
          />
        </div>
      </div>
    </div>
  );
};