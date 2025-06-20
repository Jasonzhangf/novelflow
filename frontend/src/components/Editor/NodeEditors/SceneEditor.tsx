import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

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
    constraints: [],
    personality: {},
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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

  // personality group 折叠/展开
  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // 修改 personality 某个属性的值
  const handlePersonalityValueChange = (group: string, attr: string, value: number) => {
    const newPersonality = {
      ...sceneData.personality,
      [group]: {
        ...sceneData.personality?.[group],
        [attr]: {
          ...sceneData.personality?.[group]?.[attr],
          Value: value
        }
      }
    };
    handleDataChange({ ...sceneData, personality: newPersonality });
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

  // 获取场景概览信息
  const getSceneOverview = () => {
    const overview: { [key: string]: string } = {};
    
    if (sceneData.sceneName) overview['场景名称'] = sceneData.sceneName;
    if (sceneData.location) overview['地点'] = sceneData.location;
    if (sceneData.timeOfDay) overview['时间'] = sceneData.timeOfDay;
    if (sceneData.weather) overview['天气'] = sceneData.weather;
    if (sceneData.mood) overview['氛围'] = sceneData.mood;
    
    // 角色数量
    if (sceneData.characters?.length) {
      overview['角色数量'] = `${sceneData.characters.length} 个`;
    }
    
    // 性格设定完成度
    if (sceneData.personality && Object.keys(sceneData.personality).length > 0) {
      overview['性格设定'] = `${Object.keys(sceneData.personality).length} 个组`;
    }
    
    return overview;
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">场景设定</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportJSON} className="editor-button">
            导出
          </button>
        </div>
      </div>

      {/* 场景概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">场景概览</h4>
        <div className="overview-grid">
          {Object.entries(getSceneOverview()).map(([key, value]) => (
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
              <label className="form-label">场景名称</label>
              <input
                type="text"
                value={sceneData.sceneName || ''}
                onChange={(e) => handleDataChange({ ...sceneData, sceneName: e.target.value })}
                className="form-input"
                placeholder="输入场景名称"
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">场景概要</label>
              <textarea
                value={sceneData.summary || ''}
                onChange={(e) => handleDataChange({ ...sceneData, summary: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="描述场景的主要内容和目标"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>环境设置</h3>
          </div>
          <div className="form-group-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <label className="form-label">地点</label>
                <input
                  type="text"
                  value={sceneData.location || ''}
                  onChange={(e) => handleDataChange({ ...sceneData, location: e.target.value })}
                  className="form-input"
                  placeholder="场景地点"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">时间</label>
                <input
                  type="text"
                  value={sceneData.timeOfDay || ''}
                  onChange={(e) => handleDataChange({ ...sceneData, timeOfDay: e.target.value })}
                  className="form-input"
                  placeholder="如：清晨、黄昏"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-field">
                <label className="form-label">天气</label>
                <input
                  type="text"
                  value={sceneData.weather || ''}
                  onChange={(e) => handleDataChange({ ...sceneData, weather: e.target.value })}
                  className="form-input"
                  placeholder="天气情况"
                />
              </div>
              
              <div className="form-field">
                <label className="form-label">氛围</label>
                <input
                  type="text"
                  value={sceneData.mood || ''}
                  onChange={(e) => handleDataChange({ ...sceneData, mood: e.target.value })}
                  className="form-input"
                  placeholder="情绪氛围"
                />
              </div>
            </div>
          </div>
        </div>

        {sceneData.personality && Object.keys(sceneData.personality).length > 0 && (
          <div className="form-group">
            <div className="form-group-header">
              <h3>角色性格设定</h3>
            </div>
            <div className="form-group-content">
              <div className="personality-section">
                {Object.entries(sceneData.personality).map(([group, attrs]) => (
                  <div key={group} className="personality-group">
                    <div
                      className="personality-group-header"
                      onClick={() => toggleGroup(group)}
                    >
                      <span className="personality-group-title">{group}</span>
                      <span className="personality-group-toggle">{collapsedGroups[group] ? '展开' : '收起'}</span>
                    </div>
                    {!collapsedGroups[group] && (
                      <div className="personality-group-content">
                        {Object.entries(attrs as any).map(([attrKey, attrObj]: [string, any]) => (
                          <div key={attrKey} className="personality-attr-row" style={{ alignItems: 'center', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <span className="personality-attr-caption" style={{ width: 80 }}>{attrObj.Caption}</span>
                            <span className="personality-attr-key" style={{ width: 120, color: '#aaa', fontSize: '12px' }}>{attrKey}</span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={attrObj.Value}
                              style={{ width: 120 }}
                              onChange={e => handlePersonalityValueChange(group, attrKey, Number(e.target.value))}
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={attrObj.Value}
                              style={{ width: 56 }}
                              onChange={e => handlePersonalityValueChange(group, attrKey, Number(e.target.value))}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <div className="form-group-header">
          <h3>完整JSON数据</h3>
        </div>
        <div className="form-group-content">
          <JSONEditor
            data={sceneData}
            onChange={handleDataChange}
            height="400px"
          />
        </div>
      </div>
    </div>
  );
};