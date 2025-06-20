import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

interface CharacterEditorProps {
  node: Node;
}

// personality 全量模板
const PERSONALITY_TEMPLATE = {
  CoreTemperament: {
    OptimismLevel: { Caption: '乐观度', Value: 50 },
    CalmnessLevel: { Caption: '冷静度', Value: 50 },
    ExtroversionLevel: { Caption: '外向性', Value: 50 },
    SeriousnessLevel: { Caption: '严肃性', Value: 50 },
    PatienceLevel: { Caption: '耐心度', Value: 50 },
    SensitivityLevel: { Caption: '敏感度', Value: 50 }
  },
  InternalValues: {
    HonestyLevel: { Caption: '诚实度', Value: 50 },
    KindnessLevel: { Caption: '善良度', Value: 50 },
    JusticeLevel: { Caption: '公正性', Value: 50 },
    LoyaltyLevel: { Caption: '忠诚度', Value: 50 },
    CourageLevel: { Caption: '勇气度', Value: 50 },
    StrengthOfPrinciples: { Caption: '原则性强度', Value: 50 }
  },
  ThinkingStyle: {
    LogicalityLevel: { Caption: '逻辑性', Value: 50 },
    AnalyticalLevel: { Caption: '分析性', Value: 50 },
    CreativityLevel: { Caption: '创造性', Value: 50 },
    FlexibilityLevel: { Caption: '灵活性', Value: 50 },
    CuriosityLevel: { Caption: '好奇心强度', Value: 50 },
    DepthOfThought: { Caption: '思考深度', Value: 50 }
  },
  InternalMotivation: {
    AmbitionLevel: { Caption: '野心度', Value: 50 },
    NeedForAchievementPower: { Caption: '成就/权力需求强度', Value: 50 },
    NeedForKnowledgeUnderstanding: { Caption: '求知/理解需求强度', Value: 50 },
    NeedForAffiliationBelonging: { Caption: '归属/社交需求强度', Value: 50 },
    SelfDisciplineLevel: { Caption: '自律性', Value: 50 },
    PerseveranceLevel: { Caption: '毅力强度', Value: 50 }
  },
  SelfPerception: {
    ConfidenceLevel: { Caption: '自信度', Value: 50 },
    SelfEsteemLevel: { Caption: '自尊水平', Value: 50 },
    HumilityLevel: { Caption: '谦逊度', Value: 50 },
    AnxietyLevel: { Caption: '焦虑水平', Value: 50 },
    InnerPeaceLevel: { Caption: '内在平静度', Value: 50 }
  }
};

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = true }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="form-group">
      <div className="form-group-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{title}</h3>
        <span>{isOpen ? '▼' : '►'}</span>
      </div>
      {isOpen && <div className="form-group-content">{children}</div>}
    </div>
  );
};

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [characterData, setCharacterData] = useState(node.data.characterData || {
    name: '',
    age: null,
    gender: 'other',
    background: {
      origin: '',
      occupation: '',
      history: ''
    },
    personality: {},
    relationships: [],
    language: 'chinese'
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleDataChange = (newData: any) => {
    setCharacterData(newData);
    updateNodeData(node.id, {
      characterData: newData,
      name: newData.name,
      age: newData.age,
      gender: newData.gender,
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

  // personality group 折叠/展开
  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // 修改 personality 某个属性的值
  const handlePersonalityValueChange = (group: string, attr: string, value: number) => {
    const newPersonality = {
      ...characterData.personality,
      [group]: {
        ...characterData.personality?.[group],
        [attr]: {
          ...characterData.personality?.[group]?.[attr],
          Value: value
        }
      }
    };
    handleDataChange({ ...characterData, personality: newPersonality });
  };

  // 获取角色概览信息
  const getCharacterOverview = () => {
    const overview: { [key: string]: string } = {};
    
    if (characterData.name) overview['姓名'] = characterData.name;
    if (characterData.age) overview['年龄'] = `${characterData.age} 岁`;
    if (characterData.background?.occupation) overview['职业'] = characterData.background.occupation;
    if (characterData.background?.origin) overview['出身'] = characterData.background.origin;
    if (characterData.language) overview['语言'] = characterData.language === 'chinese' ? '中文' : characterData.language;
    
    // 关系数量
    if (characterData.relationships?.length) {
      overview['关系数量'] = `${characterData.relationships.length} 个`;
    }
    
    // 性格设定完成度
    if (characterData.personality) {
      const totalGroups = Object.keys(PERSONALITY_TEMPLATE).length;
      const completedGroups = Object.keys(characterData.personality).length;
      overview['性格设定'] = `${completedGroups}/${totalGroups} 完成`;
    }
    
    return overview;
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">角色设定</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportJSON} className="editor-button">
            导出
          </button>
          <button onClick={loadTemplate} className="editor-button editor-button-secondary">
            模板
          </button>
        </div>
      </div>

      {/* 角色概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">角色概览</h4>
        <div className="overview-grid">
          {Object.entries(getCharacterOverview()).map(([key, value]) => (
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
        <CollapsibleSection title="基本信息">
          <div className="form-field">
            <label className="form-label">角色名称</label>
            <input
              type="text"
              value={characterData.name || ''}
              onChange={(e) => handleDataChange({ ...characterData, name: e.target.value })}
              className="form-input"
              placeholder="输入角色名称"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">年龄</label>
            <input
              type="number"
              value={characterData.age || ''}
              onChange={(e) => handleDataChange({ 
                ...characterData, 
                age: e.target.value ? parseInt(e.target.value) : null 
              })}
              className="form-input"
              placeholder="输入年龄"
            />
          </div>

          <div className="form-field">
            <label className="form-label">性别</label>
            <select
              value={characterData.gender || 'other'}
              onChange={(e) => handleDataChange({ ...characterData, gender: e.target.value })}
              className="form-select"
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="背景设定">
          <div className="form-field">
            <label className="form-label">职业</label>
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
              className="form-input"
              placeholder="输入职业"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="角色简介">
          <div className="form-field">
            <label className="form-label">角色简介</label>
            <textarea
              value={characterData.summary || ''}
              onChange={(e) => handleDataChange({ ...characterData, summary: e.target.value })}
              className="form-textarea"
              placeholder="简要描述角色的核心特征"
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="人物关系">
          <div className="relationships-section">
            {characterData.relationships && characterData.relationships.length > 0 ? (
              <div className="relationships-list">
                {characterData.relationships.map((relationship: any, index: number) => (
                  <div key={index} className="relationship-card">
                    <div className="relationship-header">
                      <span className="relationship-character">{relationship.character}</span>
                      <span className="relationship-type">{relationship.type}</span>
                    </div>
                    <div className="relationship-description">{relationship.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">暂无人物关系设定</div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="性格设定">
          <div className="personality-section">
            {Object.entries(PERSONALITY_TEMPLATE).map(([group, attrs]) => (
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
                    {Object.entries(attrs as any).map(([attrKey, attrTemplate]: [string, any]) => {
                      const attrObj =
                        characterData.personality?.[group]?.[attrKey] || attrTemplate;
                      return (
                        <div key={attrKey} className="personality-attr-row" style={{ alignItems: 'center', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <span className="personality-attr-caption" style={{ width: 80 }}>{attrTemplate.Caption}</span>
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
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      <CollapsibleSection title="完整JSON数据">
        <JSONEditor
          data={characterData}
          onChange={handleDataChange}
          height="400px"
        />
      </CollapsibleSection>
    </div>
  );
};