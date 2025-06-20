import React, { useState, useRef, useEffect } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

interface RelationshipEditorProps {
  node: Node;
}

export const RelationshipEditor: React.FC<RelationshipEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [relationshipData, setRelationshipData] = useState(node.data.relationshipData || {
    relationships: '',
    characterNames: [],
    relationshipMatrix: {},
    notes: ''
  });
  const [connectedCharacters, setConnectedCharacters] = useState(node.data.connectedCharacters || []);

  // 模拟从连接的角色节点获取角色名称
  useEffect(() => {
    // 这里应该从实际连接的角色节点获取名称
    // 暂时使用示例数据
    const exampleCharacters = ['李观一', '慕容秋水', '越千峰'];
    setConnectedCharacters(exampleCharacters);
    
    // 更新relationshipData中的characterNames
    setRelationshipData(prev => ({
      ...prev,
      characterNames: exampleCharacters
    }));
  }, []);

  const handleDataChange = (newData: any) => {
    setRelationshipData(newData);
    
    // 计算关系条目数量
    const relationshipLines = newData.relationships ? 
      newData.relationships.split('\n').filter((line: string) => line.trim().length > 0).length : 0;
    
    updateNodeData(node.id, {
      relationshipData: {
        ...newData,
        totalRelationships: relationshipLines
      },
      connectedCharacters: connectedCharacters,
      // 生成JSON输出，合并角色名和关系
      jsonOutput: {
        characters: connectedCharacters,
        relationships: newData.relationships,
        relationshipMatrix: newData.relationshipMatrix || {},
        metadata: {
          totalCharacters: connectedCharacters.length,
          totalRelationships: relationshipLines,
          lastUpdated: new Date().toISOString()
        }
      }
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
    const exportData = {
      characters: connectedCharacters,
      relationships: relationshipData.relationships,
      relationshipMatrix: relationshipData.relationshipMatrix || {},
      metadata: {
        totalCharacters: connectedCharacters.length,
        totalRelationships: relationshipData.relationships ? 
          relationshipData.relationships.split('\n').filter((line: string) => line.trim().length > 0).length : 0,
        exportedAt: new Date().toISOString()
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'character-relationships.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 获取关系概览信息
  const getRelationshipOverview = () => {
    const overview: { [key: string]: string } = {};
    
    overview['连接角色数'] = `${connectedCharacters.length} 个`;
    
    if (relationshipData.relationships) {
      const relationshipLines = relationshipData.relationships.split('\n').filter((line: string) => line.trim().length > 0);
      overview['关系条目'] = `${relationshipLines.length} 条`;
      overview['内容长度'] = `${relationshipData.relationships.length} 字符`;
    } else {
      overview['关系条目'] = '0 条';
      overview['内容长度'] = '0 字符';
    }
    
    if (relationshipData.relationshipMatrix && Object.keys(relationshipData.relationshipMatrix).length > 0) {
      overview['关系矩阵'] = `${Object.keys(relationshipData.relationshipMatrix).length} 对`;
    }
    
    return overview;
  };

  // 快速添加关系模板
  const addRelationshipTemplate = (template: string) => {
    const currentRelationships = relationshipData.relationships || '';
    const newRelationships = currentRelationships + (currentRelationships ? '\n' : '') + template;
    handleDataChange({ ...relationshipData, relationships: newRelationships });
  };

  const relationshipTemplates = [
    '角色A - 角色B: 朋友关系，相识多年',
    '角色A - 角色B: 师徒关系，A是B的老师',
    '角色A - 角色B: 敌对关系，因为某事产生矛盾',
    '角色A - 角色B: 亲属关系，血缘/姻缘联系',
    '角色A - 角色B: 合作关系，共同目标'
  ];

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">人物关系</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportJSON} className="editor-button">
            导出
          </button>
        </div>
      </div>

      {/* 关系概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">关系概览</h4>
        <div className="overview-grid">
          {Object.entries(getRelationshipOverview()).map(([key, value]) => (
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
            <h3>连接的角色</h3>
          </div>
          <div className="form-group-content">
            {connectedCharacters.length > 0 ? (
              <div className="relationships-list">
                {connectedCharacters.map((character: string, index: number) => (
                  <div key={index} className="relationship-card">
                    <div className="relationship-header">
                      <span className="relationship-character">{character}</span>
                      <span className="relationship-type">已连接</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                暂无连接的角色节点，请在画布中将角色节点连接到此节点的输入端
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>人物关系设定</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">关系描述 (多行复杂文本)</label>
              <textarea
                value={relationshipData.relationships || ''}
                onChange={(e) => handleDataChange({ ...relationshipData, relationships: e.target.value })}
                className="form-textarea-large"
                rows={15}
                placeholder="请详细描述角色之间的关系，每行一个关系描述&#10;例如：&#10;李观一 - 慕容秋水: 婶侄关系，慕容秋水抚养李观一长大&#10;李观一 - 越千峰: 师徒关系，越千峰教授李观一武艺&#10;慕容秋水 - 越千峰: 旧识关系，曾经的朋友"
                style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
              />
            </div>

            <div className="form-field">
              <label className="form-label">快速添加关系模板</label>
              <div className="grid grid-cols-1 gap-2">
                {relationshipTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => addRelationshipTemplate(template)}
                    className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">备注</label>
              <textarea
                value={relationshipData.notes || ''}
                onChange={(e) => handleDataChange({ ...relationshipData, notes: e.target.value })}
                className="form-textarea"
                rows={3}
                placeholder="其他关于人物关系的补充说明"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="form-group-header">
          <h3>JSON输出预览</h3>
        </div>
        <div className="form-group-content">
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify({
                characters: connectedCharacters,
                relationships: relationshipData.relationships,
                metadata: {
                  totalCharacters: connectedCharacters.length,
                  totalRelationships: relationshipData.relationships ? 
                    relationshipData.relationships.split('\n').filter((line: string) => line.trim().length > 0).length : 0
                }
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="form-group-header">
          <h3>完整数据编辑</h3>
        </div>
        <div className="form-group-content">
          <JSONEditor
            data={relationshipData}
            onChange={handleDataChange}
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};