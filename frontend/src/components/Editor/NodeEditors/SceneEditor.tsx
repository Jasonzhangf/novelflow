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

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-dark-text-primary">场景设定</h3>
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

      {/* 基本信息快速编辑 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">场景名称</label>
          <input
            type="text"
            value={sceneData.sceneName || ''}
            onChange={(e) => handleDataChange({ ...sceneData, sceneName: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
            placeholder="输入场景名称"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-1">场景概要</label>
          <textarea
            value={sceneData.summary || ''}
            onChange={(e) => handleDataChange({ ...sceneData, summary: e.target.value })}
            className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent h-24 resize-none"
            placeholder="描述场景的主要内容和目标"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">地点</label>
            <input
              type="text"
              value={sceneData.location || ''}
              onChange={(e) => handleDataChange({ ...sceneData, location: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="场景地点"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">时间</label>
            <input
              type="text"
              value={sceneData.timeOfDay || ''}
              onChange={(e) => handleDataChange({ ...sceneData, timeOfDay: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="如：清晨、黄昏"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">天气</label>
            <input
              type="text"
              value={sceneData.weather || ''}
              onChange={(e) => handleDataChange({ ...sceneData, weather: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="天气情况"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">氛围</label>
            <input
              type="text"
              value={sceneData.mood || ''}
              onChange={(e) => handleDataChange({ ...sceneData, mood: e.target.value })}
              className="w-full bg-dark-input text-dark-text-primary border border-dark-border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dark-accent"
              placeholder="情绪氛围"
            />
          </div>
        </div>
      </div>

      {/* personality 区域 */}
      <div className="border-t border-dark-border pt-4">
        <h4 className="text-base font-semibold text-dark-text-primary mb-2">角色性格（personality）</h4>
        {sceneData.personality && Object.keys(sceneData.personality).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(sceneData.personality).map(([group, attrs]) => (
              <div key={group} className="border border-dark-border rounded mb-2 bg-dark-surface">
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer bg-dark-input hover:bg-dark-hover rounded-t"
                  onClick={() => toggleGroup(group)}
                >
                  <span className="font-bold text-dark-text-primary">{group}</span>
                  <span className="text-dark-text-secondary text-xs">{collapsedGroups[group] ? '展开' : '收起'}</span>
                </div>
                {!collapsedGroups[group] && (
                  <div className="p-3 space-y-2">
                    {Object.entries(attrs as any).map(([attrKey, attrObj]: [string, any]) => (
                      <div key={attrKey} className="flex items-center gap-2">
                        <span className="w-24 text-dark-text-secondary text-xs">{attrObj.Caption}</span>
                        <span className="w-32 text-dark-text-secondary text-xs">{attrKey}</span>
                        <input
                          type="number"
                          className="w-20 bg-dark-input text-dark-text-primary border border-dark-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-dark-accent"
                          value={attrObj.Value}
                          min={0}
                          max={100}
                          onChange={e => handlePersonalityValueChange(group, attrKey, Number(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-dark-text-secondary text-sm">暂无性格设定</div>
        )}
      </div>

      <div className="border-t border-dark-border pt-4">
        <label className="block text-sm font-medium text-dark-text-secondary mb-2">完整JSON数据</label>
        <JSONEditor
          data={sceneData}
          onChange={handleDataChange}
          height="400px"
        />
      </div>
    </div>
  );
};