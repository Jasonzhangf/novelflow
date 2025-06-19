import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

interface CharacterEditorProps {
  node: Node;
}

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