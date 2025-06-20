import React, { useState, useRef } from 'react';
import { type Node } from 'reactflow';
import { useFlowContext } from '../FlowContext';
import './CharacterEditor.css';

interface TextOutputEditorProps {
  node: Node;
}

export const TextOutputEditor: React.FC<TextOutputEditorProps> = ({ node }) => {
  const { updateNodeData } = useFlowContext();
  const [content, setContent] = useState(node.data.content || '');
  const [title, setTitle] = useState(node.data.title || '文本输出');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateNodeData(node.id, {
      content: newContent,
      title: title
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateNodeData(node.id, {
      content: content,
      title: newTitle
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    // 简单的反馈，不使用alert
    const btn = document.activeElement as HTMLButtonElement;
    const originalText = btn?.textContent;
    if (btn) {
      btn.textContent = '已复制!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1000);
    }
  };

  const handleExport = () => {
    const dataStr = content;
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
      handleContentChange('');
    }
  };

  // 统计信息
  const stats = {
    characters: content.length,
    lines: content.split('\n').length,
    words: content.split(/\s+/).filter(word => word.length > 0).length
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h3 className="editor-title">文本输出</h3>
        <div className="editor-actions">
          <button onClick={handleCopy} className="editor-button" disabled={!content}>
            复制
          </button>
          <button onClick={handleExport} className="editor-button" disabled={!content}>
            导出
          </button>
          <button onClick={handleClear} className="editor-button editor-button-secondary" disabled={!content}>
            清空
          </button>
        </div>
      </div>

      {/* 统计信息卡片 */}
      <div className="text-stats-card">
        <h4 className="stats-title">文本统计</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">字符数</span>
            <span className="stat-value">{stats.characters}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">行数</span>
            <span className="stat-value">{stats.lines}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">词数</span>
            <span className="stat-value">{stats.words}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <div className="form-group-header">
            <h3>标题设置</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">输出标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="form-input"
                placeholder="输入文本输出的标题"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <h3>内容编辑</h3>
          </div>
          <div className="form-group-content">
            <div className="form-field">
              <label className="form-label">文本内容</label>
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="form-textarea-large"
                placeholder="在此编辑输出的文本内容..."
                rows={20}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};