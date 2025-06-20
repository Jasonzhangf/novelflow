import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import { JSONEditor } from '../Components/JSONEditor';
import './CharacterEditor.css';

interface UserPromptEditorProps {
  node: Node;
}

export const UserPromptEditor: React.FC<UserPromptEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptData, setPromptData] = useState(node.data.promptData || {
    promptName: '用户提示词',
    chapterTitle: '',
    chapterSummary: '',
    content: '',
    chapterType: '正文',
    targetLength: 2000,
    focusPoints: [],
    requirements: [],
    mood: '',
    pacing: 'normal'
  });

  const handleDataChange = (newData: any) => {
    setPromptData(newData);
    updateNodeData(node.id, {
      promptData: newData,
      promptName: newData.promptName,
      chapterTitle: newData.chapterTitle,
      chapterSummary: newData.chapterSummary,
      content: newData.content,
      chapterType: newData.chapterType
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
    const dataStr = JSON.stringify(promptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${promptData.promptName || 'user-prompt'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateContent = () => {
    const content = `请基于以下信息创作章节内容：

章节标题：${promptData.chapterTitle || '未设置'}
章节概要：${promptData.chapterSummary || '请根据场景和角色信息创作'}

创作要求：
- 章节类型：${promptData.chapterType}
- 目标字数：${promptData.targetLength} 字
- 节奏：${promptData.pacing === 'slow' ? '缓慢推进' : promptData.pacing === 'fast' ? '快速推进' : '正常节奏'}
- 情绪基调：${promptData.mood || '根据场景氛围确定'}

${promptData.focusPoints?.length > 0 ? `重点关注：\n${promptData.focusPoints.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}` : ''}

${promptData.requirements?.length > 0 ? `\n特殊要求：\n${promptData.requirements.map((req: string, i: number) => `${i + 1}. ${req}`).join('\n')}` : ''}

请结合前面提供的角色信息、环境设定、场景描述等，创作出符合要求的章节内容。`;

    handleDataChange({ ...promptData, content });
  };

  const addFocusPoint = () => {
    handleDataChange({
      ...promptData,
      focusPoints: [...(promptData.focusPoints || []), '']
    });
  };

  const updateFocusPoint = (index: number, value: string) => {
    const updatedPoints = [...(promptData.focusPoints || [])];
    updatedPoints[index] = value;
    handleDataChange({ ...promptData, focusPoints: updatedPoints });
  };

  const removeFocusPoint = (index: number) => {
    const updatedPoints = (promptData.focusPoints || []).filter((_: any, i: number) => i !== index);
    handleDataChange({ ...promptData, focusPoints: updatedPoints });
  };

  const addRequirement = () => {
    handleDataChange({
      ...promptData,
      requirements: [...(promptData.requirements || []), '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updatedReqs = [...(promptData.requirements || [])];
    updatedReqs[index] = value;
    handleDataChange({ ...promptData, requirements: updatedReqs });
  };

  const removeRequirement = (index: number) => {
    const updatedReqs = (promptData.requirements || []).filter((_: any, i: number) => i !== index);
    handleDataChange({ ...promptData, requirements: updatedReqs });
  };

  // 获取提示词概览信息
  const getPromptOverview = () => {
    const overview: { [key: string]: string } = {};
    
    overview['提示词名称'] = promptData.promptName || '用户提示词';
    overview['章节标题'] = promptData.chapterTitle || '未设置';
    overview['章节类型'] = promptData.chapterType || '正文';
    overview['目标字数'] = `${promptData.targetLength || 2000} 字`;
    overview['节奏控制'] = promptData.pacing === 'slow' ? '缓慢推进' : promptData.pacing === 'fast' ? '快速推进' : '正常节奏';
    overview['内容长度'] = promptData.content ? `${promptData.content.length} 字符` : '0 字符';
    if (promptData.focusPoints?.length) {
      overview['重点关注'] = `${promptData.focusPoints.length} 个`;
    }
    
    return overview;
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">用户提示词设定</h3>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="editor-button">
            导入
          </button>
          <button onClick={handleExportJSON} className="editor-button">
            导出
          </button>
          <button onClick={generateContent} className="editor-button">
            生成内容
          </button>
        </div>
      </div>

      {/* 提示词概览卡片 */}
      <div className="character-overview-card">
        <h4 className="overview-title">提示词概览</h4>
        <div className="overview-grid">
          {Object.entries(getPromptOverview()).map(([key, value]) => (
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
              <label className="form-label">提示词名称</label>
              <input
                type="text"
                value={promptData.promptName || ''}
                onChange={(e) => handleDataChange({ ...promptData, promptName: e.target.value })}
                className="form-input"
                placeholder="为该提示词命名"
              />
            </div>

            <div className="form-field">
              <label className="form-label">章节标题</label>
              <input
                type="text"
                value={promptData.chapterTitle || ''}
                onChange={(e) => handleDataChange({ ...promptData, chapterTitle: e.target.value })}
                className="form-input"
                placeholder="输入章节标题"
              />
            </div>

            <div className="form-field">
              <label className="form-label">章节概要</label>
              <textarea
                value={promptData.chapterSummary || ''}
                onChange={(e) => handleDataChange({ ...promptData, chapterSummary: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder="简要描述本章节的主要内容和目标"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-field">
                <label className="form-label">章节类型</label>
                <select
                  value={promptData.chapterType || '正文'}
                  onChange={(e) => handleDataChange({ ...promptData, chapterType: e.target.value })}
                  className="form-select"
                >
                  <option value="序章">序章</option>
                  <option value="正文">正文</option>
                  <option value="过渡">过渡章节</option>
                  <option value="高潮">高潮章节</option>
                  <option value="结尾">结尾章节</option>
                  <option value="回忆">回忆章节</option>
                </select>
              </div>
              
              <div className="form-field">
                <label className="form-label">目标字数</label>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  value={promptData.targetLength || 2000}
                  onChange={(e) => handleDataChange({ ...promptData, targetLength: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-field">
                <label className="form-label">节奏控制</label>
                <select
                  value={promptData.pacing || 'normal'}
                  onChange={(e) => handleDataChange({ ...promptData, pacing: e.target.value })}
                  className="form-select"
                >
                  <option value="slow">缓慢推进</option>
                  <option value="normal">正常节奏</option>
                  <option value="fast">快速推进</option>
                </select>
              </div>
              
              <div className="form-field">
                <label className="form-label">情绪基调</label>
                <input
                  type="text"
                  value={promptData.mood || ''}
                  onChange={(e) => handleDataChange({ ...promptData, mood: e.target.value })}
                  className="form-input"
                  placeholder="如：紧张、轻松、神秘"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>重点关注</h3>
            <button
              onClick={addFocusPoint}
              className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              添加重点
            </button>
          </div>
          <div className="form-group-content">
            {promptData.focusPoints?.map((point: string, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateFocusPoint(index, e.target.value)}
                  placeholder="输入需要重点关注的内容"
                  className="form-input flex-1"
                />
                <button
                  onClick={() => removeFocusPoint(index)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>特殊要求</h3>
            <button
              onClick={addRequirement}
              className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              添加要求
            </button>
          </div>
          <div className="form-group-content">
            {promptData.requirements?.map((req: string, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="输入特殊创作要求"
                  className="form-input flex-1"
                />
                <button
                  onClick={() => removeRequirement(index)}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>提示词内容</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">完整的用户提示词内容</label>
              <textarea
                value={promptData.content || ''}
                onChange={(e) => handleDataChange({ ...promptData, content: e.target.value })}
                className="form-textarea-large"
                rows={10}
                placeholder="完整的用户提示词内容，可以使用上方的'生成内容'按钮自动生成"
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
            data={promptData}
            onChange={handleDataChange}
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};